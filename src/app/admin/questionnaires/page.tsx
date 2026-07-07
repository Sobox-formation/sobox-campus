import Link from "next/link";
import { getAdminQuestionnaires } from "@/lib/admin";
import NewQuestionnaireButton from "@/components/new-questionnaire-button";

export default async function AdminQuestionnairesPage() {
  const list = await getAdminQuestionnaires();

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal">
            Administration
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold text-ink">
            Questionnaires de profil
          </h1>
          <p className="mt-2 text-slate-500">
            Les auto-diagnostics soft-skills : dimensions, questions et clé de
            scoring.
          </p>
        </div>
        <NewQuestionnaireButton />
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {list.length === 0 && (
          <p className="px-5 py-4 text-sm text-slate-400">
            Aucun questionnaire. Clique « + Nouveau questionnaire ».
          </p>
        )}
        {list.map((q, i) => (
          <Link
            key={q.id}
            href={`/admin/questionnaires/${q.id}`}
            className={[
              "flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50",
              i < list.length - 1 ? "border-b border-slate-100" : "",
            ].join(" ")}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{q.titre}</p>
              <p className="truncate text-xs text-slate-400">
                {q.categorie ?? "—"}
                {q.source === "google_form" && " · encore sur Google Form"}
              </p>
            </div>
            {!q.actif && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                Inactif
              </span>
            )}
            <span className="text-xs font-medium text-slate-400">
              {q.nbDimensions} dim. · {q.nbQuestions} q.
            </span>
            <span className="text-teal">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
