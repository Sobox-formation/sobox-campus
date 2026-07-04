import Link from "next/link";
import { getEvaluations, type QuizListItem } from "@/lib/quiz";

function QuizCard({ q }: { q: QuizListItem }) {
  const passed = q.best?.reussi;
  return (
    <div
      className={[
        "flex flex-col rounded-2xl border border-slate-200 bg-white p-5",
        q.locked ? "opacity-70" : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        {q.moduleCode && (
          <span className="grid h-7 min-w-7 place-items-center rounded-lg bg-slate-100 px-1.5 font-display text-xs font-bold text-slate-500">
            {q.moduleCode}
          </span>
        )}
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
          {q.source === "google_form" ? "Questionnaire" : "Quiz de validation"}
        </span>
        {q.best && (
          <span
            className={[
              "ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums",
              passed
                ? "bg-emerald-50 text-emerald-600"
                : "bg-orange/10 text-orange",
            ].join(" ")}
          >
            {passed ? "Réussi" : "Meilleur"} {q.best.score}%
          </span>
        )}
      </div>

      <h3 className="mt-2.5 font-semibold text-ink">{q.titre}</h3>
      {q.description && (
        <p className="mt-1 text-xs text-slate-500">{q.description}</p>
      )}

      <div className="mt-auto pt-4">
        {q.locked ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            Se débloque avec le module
          </span>
        ) : q.source === "google_form" ? (
          <a
            href={q.formUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-lg bg-teal px-3 py-1.5 text-xs font-bold text-white transition hover:bg-teal-dark"
          >
            Ouvrir le questionnaire →
          </a>
        ) : (
          <Link
            href={`/evaluations/${q.id}`}
            className="inline-flex rounded-lg bg-teal px-3 py-1.5 text-xs font-bold text-white transition hover:bg-teal-dark"
          >
            {passed ? "Refaire le quiz" : "Faire le quiz"} →
          </Link>
        )}
      </div>
    </div>
  );
}

export default async function EvaluationsPage() {
  const data = await getEvaluations();
  const quizzes = data?.quizzes ?? [];
  const history = data?.history ?? [];

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-teal">
        Validation des acquis
      </p>
      <h1 className="font-display mt-1 text-3xl font-bold text-ink">
        Mes évaluations
      </h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Tes quiz de validation après chaque module. Réussir un quiz valide le
        module et débloque l’étape suivante de ton parcours.
      </p>

      {!data?.parcours ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Aucun parcours attribué pour l’instant.
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((q) => (
              <QuizCard key={q.id} q={q} />
            ))}
          </div>

          <h2 className="font-display mt-12 text-lg font-bold text-ink">
            Historique
          </h2>
          {history.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Tu n’as pas encore passé de quiz. Lance-toi dès qu’un module est
              disponible !
            </p>
          ) : (
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {history.map((h, i) => (
                <div
                  key={i}
                  className={[
                    "flex items-center gap-4 px-5 py-3.5",
                    i < history.length - 1 ? "border-b border-slate-100" : "",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "grid h-8 w-8 flex-none place-items-center rounded-full text-xs font-bold",
                      h.reussi
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-400",
                    ].join(" ")}
                  >
                    {h.reussi ? "✓" : "–"}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                    {h.titre}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-slate-600">
                    {h.score}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
