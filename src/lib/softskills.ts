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

/* ---------- Questionnaires de type « score global + niveau » ----------
 * Ces auto-diagnostics ne sont pas des profils par dimensions : ils
 * produisent un score total (une seule « dimension score ») interprété
 * en un niveau. Les tranches ci-dessous sont provisoires (à affiner). */

export type ScoreBand = {
  min: number;
  max: number;
  label: string;
  text: string;
};

export const SCORE_BANDS: Record<string, ScoreBand[]> = {
  confiance_soi: [
    {
      min: 0,
      max: 17,
      label: "Confiance à construire",
      text: "Dans plusieurs situations, tu doutes encore de toi. La confiance est un muscle : commence par de petits défis où tu te sens légitime, et capitalise sur chaque réussite.",
    },
    {
      min: 18,
      max: 29,
      label: "Confiance en développement",
      text: "Ta confiance est présente mais fluctuante selon les contextes. Repère les situations qui te déstabilisent pour mieux t'y préparer.",
    },
    {
      min: 30,
      max: 40,
      label: "Bonne confiance en soi",
      text: "Tu abordes la plupart des situations avec assurance. Continue à sortir de ta zone de confort pour l'ancrer encore davantage.",
    },
    {
      min: 41,
      max: 50,
      label: "Confiance affirmée",
      text: "Tu dégages une réelle assurance dans la majorité des situations. Veille à ce qu'elle reste de l'assurance… et non de l'excès de confiance.",
    },
  ],
};

/** Un questionnaire est « scoré » (score+niveau) s'il a une table de tranches. */
export function isScoreType(code: string): boolean {
  return code in SCORE_BANDS;
}

export function scoreTotal(scores: Record<string, number>): number {
  return Object.values(scores).reduce((a, b) => a + Number(b || 0), 0);
}

export function getScoreBand(code: string, total: number): ScoreBand | null {
  const bands = SCORE_BANDS[code];
  if (!bands) return null;
  return bands.find((b) => total >= b.min && total <= b.max) ?? null;
}
