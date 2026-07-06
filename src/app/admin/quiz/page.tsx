import Link from "next/link";
import { getAdminQuizzes } from "@/lib/admin";
import NewQuizButton from "@/components/new-quiz-button";

export default async function AdminQuizListPage() {
  const quizzes = await getAdminQuizzes();
  const moduleQuizzes = quizzes.filter((q) => q.moduleCode);
  const libraryQuizzes = quizzes.filter((q) => !q.moduleCode);

  const Row = ({ q }: { q: (typeof quizzes)[number] }) => (
    <Link
      href={`/admin/quiz/${q.id}`}
      className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5 transition last:border-0 hover:bg-slate-50"
    >
      {q.moduleCode && (
        <span className="grid h-7 min-w-7 place-items-center rounded-lg bg-slate-100 px-1.5 font-display text-xs font-bold text-slate-500">
          {q.moduleCode}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
        {q.titre}
      </span>
      <span className="text-xs font-medium text-slate-400">
        {q.nbQuestions} question{q.nbQuestions > 1 ? "s" : ""}
      </span>
      <span className="text-teal">›</span>
    </Link>
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal">
            Administration
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold text-ink">
            Éditeur de quiz
          </h1>
          <p className="mt-2 text-slate-500">
            Crée, modifie et corrige les quiz et leurs bonnes réponses.
          </p>
        </div>
        <NewQuizButton />
      </div>

      <h2 className="font-display mt-8 text-lg font-bold text-ink">
        Quiz des modules
      </h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {moduleQuizzes.length ? (
          moduleQuizzes.map((q) => <Row key={q.id} q={q} />)
        ) : (
          <p className="px-5 py-4 text-sm text-slate-400">Aucun quiz de module.</p>
        )}
      </div>

      <h2 className="font-display mt-8 text-lg font-bold text-ink">
        Bibliothèque de quiz
      </h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {libraryQuizzes.length ? (
          libraryQuizzes.map((q) => <Row key={q.id} q={q} />)
        ) : (
          <p className="px-5 py-4 text-sm text-slate-400">
            Aucun quiz autonome. Clique « + Nouveau quiz » pour en créer un.
          </p>
        )}
      </div>
    </div>
  );
}
