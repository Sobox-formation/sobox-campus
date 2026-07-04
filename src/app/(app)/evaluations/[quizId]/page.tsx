import Link from "next/link";
import { getQuizForPlay } from "@/lib/quiz";
import QuizPlayer from "@/components/quiz-player";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const data = await getQuizForPlay(quizId);

  if (!data || !data.found || !data.quiz) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="font-display text-lg font-bold text-ink">
          Quiz introuvable
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Ce quiz n’existe pas ou n’est pas un quiz interactif.
        </p>
        <Link
          href="/evaluations"
          className="mt-4 inline-flex text-sm font-semibold text-teal hover:underline"
        >
          ← Retour aux évaluations
        </Link>
      </div>
    );
  }

  if (data.locked) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="font-display text-lg font-bold text-ink">
          Quiz verrouillé
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Ce quiz se débloquera une fois le module correspondant disponible dans
          ton parcours.
        </p>
        <Link
          href="/evaluations"
          className="mt-4 inline-flex text-sm font-semibold text-teal hover:underline"
        >
          ← Retour aux évaluations
        </Link>
      </div>
    );
  }

  return <QuizPlayer quiz={data.quiz} questions={data.questions} />;
}
