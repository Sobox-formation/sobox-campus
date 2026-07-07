import { createClient } from "@/lib/supabase/server";

export type PlayOption = { id: string; texte: string };

export type PlayQuestion = {
  id: string;
  ordre: number;
  texte: string;
  type: string;
  options: PlayOption[];
};

export type QuestionnairePlay = {
  id: string;
  code: string;
  titre: string;
  description: string | null;
  consigne: string;
  questions: PlayQuestion[];
};

// Consigne affichée en tête de passation, par questionnaire.
const CONSIGNE: Record<string, string> = {
  assertivite:
    "Pour chacune des descriptions suivantes, indique ta posture privilégiée dans ta relation aux autres. Réponds spontanément et honnêtement : il n'y a ni bonne ni mauvaise réponse.",
};

/**
 * Charge un questionnaire natif pour passation.
 * Ne renvoie que les colonnes visibles par l'apprenant (la clé de scoring
 * — dimension, sens — reste cachée en base et n'est lue que côté serveur).
 */
export async function getQuestionnaireForPlay(
  code: string,
): Promise<QuestionnairePlay | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: q } = await supabase
    .from("questionnaires")
    .select("id, code, titre, description, source")
    .eq("code", code)
    .maybeSingle();
  if (!q || q.source !== "natif") return null;

  const { data: questions } = await supabase
    .from("questionnaire_questions")
    .select("id, ordre, texte, type")
    .eq("questionnaire_id", q.id)
    .order("ordre");

  if (!questions || questions.length === 0) return null;

  // Options (pour les questions à choix). Colonnes de scoring cachées côté apprenant.
  const { data: opts } = await supabase
    .from("questionnaire_question_options")
    .select("id, question_id, ordre, texte")
    .in(
      "question_id",
      questions.map((x) => x.id),
    )
    .order("ordre");

  const byQ = new Map<string, PlayOption[]>();
  (opts ?? []).forEach((o) => {
    const arr = byQ.get(o.question_id) ?? [];
    arr.push({ id: o.id, texte: o.texte });
    byQ.set(o.question_id, arr);
  });

  return {
    id: q.id,
    code: q.code,
    titre: q.titre,
    description: q.description,
    consigne:
      CONSIGNE[code] ??
      "Réponds spontanément à chaque question : il n'y a ni bonne ni mauvaise réponse.",
    questions: questions.map((x) => ({
      id: x.id,
      ordre: x.ordre,
      texte: x.texte,
      type: x.type,
      options: byQ.get(x.id) ?? [],
    })),
  };
}
