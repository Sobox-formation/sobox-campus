"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { QuestionnairePlay } from "@/lib/questionnaire";

export default function QuestionnairePlayer({
  questionnaire,
}: {
  questionnaire: QuestionnairePlay;
}) {
  const router = useRouter();
  const { questions, code, titre, consigne } = questionnaire;
  const total = questions.length;

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = questions[idx];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === total;
  const currentAnswer = answers[current.id];

  function answer(val: boolean) {
    setAnswers((a) => ({ ...a, [current.id]: val }));
    if (idx < total - 1) {
      // petit délai pour laisser voir la sélection avant d'avancer
      setTimeout(() => setIdx((i) => Math.min(i + 1, total - 1)), 160);
    }
  }

  async function submit() {
    if (submitting || !allAnswered) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data, error: fnError } = await supabase.functions.invoke(
      "score-questionnaire",
      { body: { code, answers } },
    );

    if (fnError || (data && (data as { error?: string }).error)) {
      setError(
        "Une erreur est survenue lors de l'enregistrement. Merci de réessayer.",
      );
      setSubmitting(false);
      return;
    }

    router.push(`/soft-skills/${code}`);
    router.refresh();
  }

  const pct = Math.round((answeredCount / total) * 100);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/soft-skills"
        className="text-sm font-semibold text-teal hover:underline"
      >
        ← Tests &amp; soft skills
      </Link>
      <h1 className="font-display mt-3 text-2xl font-bold text-ink">{titre}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{consigne}</p>

      {/* Progression */}
      <div className="mt-6 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-bold tabular-nums text-slate-500">
          {answeredCount}/{total}
        </span>
      </div>

      {/* Question courante */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Affirmation {idx + 1} / {total}
        </p>
        <p className="mt-3 min-h-[72px] text-lg font-medium leading-relaxed text-ink">
          {current.texte}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => answer(true)}
            className={[
              "rounded-xl border-2 px-4 py-4 text-sm font-bold transition",
              currentAnswer === true
                ? "border-teal bg-teal text-white"
                : "border-slate-200 text-slate-600 hover:border-teal hover:text-teal",
            ].join(" ")}
          >
            Plutôt VRAI
          </button>
          <button
            type="button"
            onClick={() => answer(false)}
            className={[
              "rounded-xl border-2 px-4 py-4 text-sm font-bold transition",
              currentAnswer === false
                ? "border-rose bg-rose text-white"
                : "border-slate-200 text-slate-600 hover:border-rose hover:text-rose",
            ].join(" ")}
          >
            Plutôt FAUX
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
        >
          ← Précédent
        </button>
        <button
          type="button"
          onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
          disabled={idx === total - 1}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
        >
          Suivant →
        </button>
      </div>

      {/* Soumission */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        {!allAnswered ? (
          <p className="text-center text-sm text-slate-500">
            Réponds aux {total} affirmations pour découvrir ton profil.
            <span className="ml-1 font-semibold text-slate-600">
              Reste {total - answeredCount} à compléter.
            </span>
          </p>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-semibold text-emerald-600">
              ✓ Toutes les affirmations sont complétées.
            </p>
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="rounded-xl bg-teal px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-dark disabled:opacity-60"
            >
              {submitting ? "Calcul en cours…" : "Voir mon profil →"}
            </button>
          </div>
        )}
        {error && (
          <p className="mt-3 text-center text-sm font-medium text-rose">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
