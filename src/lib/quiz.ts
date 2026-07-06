import { createClient } from "@/lib/supabase/server";
import { getParcoursData } from "@/lib/parcours";

export type QuizListItem = {
  id: string;
  titre: string;
  description: string | null;
  source: string;
  formUrl: string | null;
  seuil: number;
  moduleCode: string;
  moduleTitre: string;
  ordre: number;
  statut: string;
  locked: boolean;
  best: { score: number; reussi: boolean } | null;
  attempts: number;
};

export type QuizHistoryItem = {
  quizId: string;
  titre: string;
  score: number;
  reussi: boolean;
  passeLe: string;
};

export async function getEvaluations(): Promise<{
  parcours: unknown;
  quizzes: QuizListItem[];
  history: QuizHistoryItem[];
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const data = await getParcoursData();
  if (!data?.parcours) return { parcours: null, quizzes: [], history: [] };

  const moduleById = new Map(data.modules.map((m) => [m.id, m]));
  const moduleIds = data.modules.map((m) => m.id);

  const { data: quizzes } = await supabase
    .from("quiz")
    .select("id, titre, description, source, form_url, seuil_reussite, module_id")
    .in("module_id", moduleIds);

  const { data: results } = await supabase
    .from("quiz_resultats")
    .select("quiz_id, score, reussi, passe_le")
    .eq("profil_id", user.id)
    .order("passe_le", { ascending: false });

  const resByQuiz = new Map<
    string,
    { score: number; reussi: boolean; passe_le: string }[]
  >();
  (results ?? []).forEach((r) => {
    const arr = resByQuiz.get(r.quiz_id) ?? [];
    arr.push({ score: Number(r.score), reussi: r.reussi, passe_le: r.passe_le });
    resByQuiz.set(r.quiz_id, arr);
  });

  const list: QuizListItem[] = (quizzes ?? [])
    .map((qz) => {
      const m = qz.module_id ? moduleById.get(qz.module_id) : undefined;
      const statut = m?.statut ?? "verrouille";
      const rs = resByQuiz.get(qz.id) ?? [];
      const best = rs.length
        ? rs.reduce((a, b) => (b.score > a.score ? b : a))
        : null;
      return {
        id: qz.id,
        titre: qz.titre,
        description: qz.description,
        source: qz.source,
        formUrl: qz.form_url,
        seuil: qz.seuil_reussite,
        moduleCode: m?.code ?? "",
        moduleTitre: m?.titre ?? "",
        ordre: m?.ordre ?? 999,
        statut,
        locked: statut === "verrouille",
        best: best ? { score: best.score, reussi: best.reussi } : null,
        attempts: rs.length,
      };
    })
    .sort((a, b) => a.ordre - b.ordre);

  const history: QuizHistoryItem[] = (results ?? []).map((r) => {
    const qz = (quizzes ?? []).find((x) => x.id === r.quiz_id);
    return {
      quizId: r.quiz_id,
      titre: qz?.titre ?? "Quiz",
      score: Number(r.score),
      reussi: r.reussi,
      passeLe: r.passe_le,
    };
  });

  return { parcours: data.parcours, quizzes: list, history };
}

// Quiz autonomes (sans module) — la Bibliothèque de quiz, en accès libre.
export async function getQuizLibrary(): Promise<QuizListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: quizzes } = await supabase
    .from("quiz")
    .select("id, titre, description, source, form_url, seuil_reussite, module_id")
    .is("module_id", null)
    .eq("source", "natif");

  const { data: results } = await supabase
    .from("quiz_resultats")
    .select("quiz_id, score, reussi")
    .eq("profil_id", user.id);

  const resByQuiz = new Map<string, { score: number; reussi: boolean }[]>();
  (results ?? []).forEach((r) => {
    const arr = resByQuiz.get(r.quiz_id) ?? [];
    arr.push({ score: Number(r.score), reussi: r.reussi });
    resByQuiz.set(r.quiz_id, arr);
  });

  return (quizzes ?? [])
    .map((qz) => {
      const rs = resByQuiz.get(qz.id) ?? [];
      const best = rs.length ? rs.reduce((a, b) => (b.score > a.score ? b : a)) : null;
      return {
        id: qz.id,
        titre: qz.titre,
        description: qz.description,
        source: qz.source,
        formUrl: qz.form_url,
        seuil: qz.seuil_reussite,
        moduleCode: "",
        moduleTitre: "",
        ordre: 999,
        statut: "disponible",
        locked: false,
        best: best ? { score: best.score, reussi: best.reussi } : null,
        attempts: rs.length,
      };
    })
    .sort((a, b) => a.titre.localeCompare(b.titre));
}

export type PlayQuestion = {
  id: string;
  enonce: string;
  options: { id: string; libelle: string }[];
};

export async function getQuizForPlay(quizId: string): Promise<{
  quiz: { id: string; titre: string; description: string | null; seuil: number } | null;
  questions: PlayQuestion[];
  locked: boolean;
  found: boolean;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: qz } = await supabase
    .from("quiz")
    .select("id, titre, description, seuil_reussite, source, module_id")
    .eq("id", quizId)
    .single();

  if (!qz || qz.source !== "natif") {
    return { quiz: null, questions: [], locked: false, found: false };
  }

  // Un quiz autonome (bibliothèque, sans module) n'est jamais verrouillé.
  const data = await getParcoursData();
  const m = data?.modules.find((mm) => mm.id === qz.module_id);
  const locked = qz.module_id
    ? (m?.statut ?? "verrouille") === "verrouille"
    : false;

  const { data: qs } = await supabase
    .from("quiz_questions")
    .select("id, ordre, enonce, quiz_options ( id, ordre, libelle )")
    .eq("quiz_id", quizId)
    .order("ordre");

  const questions: PlayQuestion[] = (qs ?? []).map((q) => {
    const opts = (q.quiz_options ?? []) as {
      id: string;
      ordre: number;
      libelle: string;
    }[];
    return {
      id: q.id,
      enonce: q.enonce,
      options: opts
        .sort((a, b) => a.ordre - b.ordre)
        .map((o) => ({ id: o.id, libelle: o.libelle })),
    };
  });

  return {
    quiz: {
      id: qz.id,
      titre: qz.titre,
      description: qz.description,
      seuil: qz.seuil_reussite,
    },
    questions,
    locked,
    found: true,
  };
}
