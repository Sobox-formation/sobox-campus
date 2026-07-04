import { createClient } from "@/lib/supabase/server";

export type SoftSkillDimension = {
  code: string;
  libelle: string;
  ordre: number;
  scoreMax: number;
};

export type SoftSkillResult = {
  scores: Record<string, number>;
  profilDominant: string | null;
  pdfUrl: string | null;
  passeLe: string;
};

export type SoftSkillItem = {
  id: string;
  code: string;
  titre: string;
  description: string | null;
  categorie: string | null;
  source: string;
  formUrl: string | null;
  dimensions: SoftSkillDimension[];
  result: SoftSkillResult | null;
};

export async function getSoftSkills(): Promise<SoftSkillItem[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: qs } = await supabase
    .from("questionnaires")
    .select("id, code, titre, description, categorie, source, form_url")
    .eq("actif", true)
    .order("code");

  const { data: dims } = await supabase
    .from("questionnaire_dimensions")
    .select("questionnaire_id, code, libelle, ordre, score_max")
    .order("ordre");

  const { data: results } = await supabase
    .from("questionnaire_resultats")
    .select("questionnaire_id, scores, profil_dominant, pdf_url, passe_le")
    .eq("profil_id", user.id)
    .order("passe_le", { ascending: false });

  const dimByQ = new Map<string, SoftSkillDimension[]>();
  (dims ?? []).forEach((d) => {
    const arr = dimByQ.get(d.questionnaire_id) ?? [];
    arr.push({
      code: d.code,
      libelle: d.libelle,
      ordre: d.ordre,
      scoreMax: d.score_max,
    });
    dimByQ.set(d.questionnaire_id, arr);
  });

  const resByQ = new Map<string, SoftSkillResult>();
  (results ?? []).forEach((r) => {
    if (!resByQ.has(r.questionnaire_id)) {
      resByQ.set(r.questionnaire_id, {
        scores: (r.scores ?? {}) as Record<string, number>,
        profilDominant: r.profil_dominant,
        pdfUrl: r.pdf_url,
        passeLe: r.passe_le,
      });
    }
  });

  return (qs ?? [])
    .map((q) => ({
      id: q.id,
      code: q.code,
      titre: q.titre,
      description: q.description,
      categorie: q.categorie,
      source: q.source,
      formUrl: q.form_url,
      dimensions: dimByQ.get(q.id) ?? [],
      result: resByQ.get(q.id) ?? null,
    }))
    // Les questionnaires complétés d'abord
    .sort((a, b) => (b.result ? 1 : 0) - (a.result ? 1 : 0));
}

export async function getQuestionnaireDetail(
  code: string,
): Promise<SoftSkillItem | null> {
  const all = await getSoftSkills();
  return all?.find((q) => q.code === code) ?? null;
}
