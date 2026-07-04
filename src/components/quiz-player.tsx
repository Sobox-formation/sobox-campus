"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Question = {
  id: string;
  enonce: string;
  options: { id: string; libelle: string }[];
};

type Result = {
  score: number;
  reussi: boolean;
  correct: number;
  total: number;
  seuil: number;
  moduleDebloque: boolean;
};

export default function QuizPlayer({
  quiz,
  questions,
}: {
  quiz: { id: string; titre: string; description: string | null; seuil: number };
  questions: Question[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  async function submit() {
    setError(null);
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("correct-quiz", {
      body: { quizId: quiz.id, answers },
    });
    setSubmitting(false);
    if (error || data?.error) {
      setError("Une erreur est survenue lors de la correction. Réessaie.");
      return;
    }
    setResult(data as Result);
    router.refresh();
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div
          className={[
            "mx-auto grid h-24 w-24 place-items-center rounded-full text-3xl font-bold",
            result.reussi
              ? "bg-emerald-50 text-emerald-600"
              : "bg-orange/10 text-orange",
          ].join(" ")}
        >
          {result.score}%
        </div>
        <h2 className="font-display mt-5 text-2xl font-bold text-ink">
          {result.reussi ? "Bravo, c’est validé ! 🎉" : "Presque !"}
        </h2>
        <p className="mt-2 text-slate-500">
          {result.correct} bonne{result.correct > 1 ? "s" : ""} réponse
          {result.correct > 1 ? "s" : ""} sur {result.total} — seuil de réussite{" "}
          {result.seuil}%.
        </p>
        {result.reussi && result.moduleDebloque && (
          <p className="mt-4 rounded-xl bg-teal/10 px-4 py-3 text-sm font-semibold text-teal-dark">
            🔓 Module validé — l’étape suivante de ton parcours vient d’être
            débloquée !
          </p>
        )}
        {!result.reussi && (
          <p className="mt-4 text-sm text-slate-500">
            Tu peux revoir tes supports puis retenter — seule ta meilleure note
            est conservée.
          </p>
        )}
        <div className="mt-7 flex justify-center gap-3">
          <Link
            href="/evaluations"
            className="rounded-xl bg-teal px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-dark"
          >
            Retour aux évaluations
          </Link>
          {!result.reussi && (
            <button
              onClick={() => {
                setResult(null);
                setAnswers({});
              }}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-teal hover:text-teal"
            >
              Recommencer
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/evaluations"
        className="text-sm font-semibold text-teal hover:underline"
      >
        ← Mes évaluations
      </Link>
      <h1 className="font-display mt-3 text-3xl font-bold text-ink">
        {quiz.titre}
      </h1>
      {quiz.description && (
        <p className="mt-2 text-slate-500">{quiz.description}</p>
      )}

      <div className="mt-8 space-y-5">
        {questions.map((q, i) => (
          <fieldset
            key={q.id}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <legend className="sr-only">{q.enonce}</legend>
            <p className="font-semibold text-ink">
              <span className="text-teal">{i + 1}.</span> {q.enonce}
            </p>
            <div className="mt-3 space-y-2">
              {q.options.map((o) => {
                const checked = answers[q.id] === o.id;
                return (
                  <label
                    key={o.id}
                    className={[
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition",
                      checked
                        ? "border-teal bg-teal/5 font-semibold text-ink"
                        : "border-slate-200 hover:border-teal/40",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={o.id}
                      checked={checked}
                      onChange={() =>
                        setAnswers((a) => ({ ...a, [q.id]: o.id }))
                      }
                      className="h-4 w-4 accent-teal"
                    />
                    {o.libelle}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {error && (
        <p className="mt-5 rounded-lg bg-rose/10 px-3 py-2 text-sm text-rose">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 mt-6 flex items-center justify-between gap-4 border-t border-slate-200 bg-background/90 py-4 backdrop-blur">
        <span className="text-sm text-slate-500">
          {answeredCount}/{questions.length} répondu
          {answeredCount > 1 ? "es" : "e"}
        </span>
        <button
          onClick={submit}
          disabled={!allAnswered || submitting}
          className="rounded-xl bg-teal px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-dark disabled:opacity-50"
        >
          {submitting ? "Correction…" : "Valider mes réponses"}
        </button>
      </div>
    </div>
  );
}
