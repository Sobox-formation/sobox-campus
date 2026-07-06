import { createClient } from "@/lib/supabase/server";

export type AdminQuizRow = {
  id: string;
  titre: string;
  moduleCode: string | null;
  moduleTitre: string | null;
  ordre: number;
  nbQuestions: number;
};

export async function getAdminQuizzes(): Promise<AdminQuizRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz")
    .select(
      "id, titre, module_id, module:modules(code, titre, ordre), quiz_questions(count)",
    )
    .eq("source", "natif");

  return (data ?? [])
    .map((q) => {
      const m = (Array.isArray(q.module) ? q.module[0] : q.module) as
        | { code: string; titre: string; ordre: number }
        | undefined;
      const qq = q.quiz_questions as { count: number }[] | undefined;
      const cnt = Array.isArray(qq) ? (qq[0]?.count ?? 0) : 0;
      return {
        id: q.id,
        titre: q.titre,
        moduleCode: m?.code ?? null,
        moduleTitre: m?.titre ?? null,
        ordre: m?.ordre ?? 999,
        nbQuestions: Number(cnt),
      };
    })
    .sort((a, b) => a.ordre - b.ordre || a.titre.localeCompare(b.titre));
}

export type EditOption = { id?: string; libelle: string; est_correcte: boolean };
export type EditQuestion = {
  id?: string;
  enonce: string;
  type: string;
  points?: number;
  options: EditOption[];
};
export type QuizEdit = {
  id: string;
  titre: string;
  description: string | null;
  seuil: number;
  moduleCode: string | null;
  moduleTitre: string | null;
  questions: EditQuestion[];
};

export async function getQuizForEdit(id: string): Promise<QuizEdit | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_get_quiz", {
    p_quiz_id: id,
  });
  if (error || !data) return null;
  return data as QuizEdit;
}
