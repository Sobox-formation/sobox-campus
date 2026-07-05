import { createClient } from "@/lib/supabase/server";

export type PlayQuestion = {
  id: string;
  ordre: number;
  texte: string;
  type: string;
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

  return {
    id: q.id,
    code: q.code,
    titre: q.titre,
    description: q.description,
    consigne:
      CONSIGNE[code] ??
      "Réponds spontanément à chaque affirmation : il n'y a ni bonne ni mauvaise réponse.",
    questions: questions.map((x) => ({
      id: x.id,
      ordre: x.ordre,
      texte: x.texte,
      type: x.type,
    })),
  };
}
