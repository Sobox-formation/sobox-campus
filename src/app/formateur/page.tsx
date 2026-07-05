import Link from "next/link";
import { getFormateurOverview } from "@/lib/formateur";

export default async function FormateurPromoPage() {
  const data = await getFormateurOverview();
  const learners = data?.learners ?? [];
  const avg =
    learners.length > 0
      ? Math.round(
          learners.reduce((s, l) => s + l.progression, 0) / learners.length,
        )
      : 0;

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-teal">
        {data?.client ?? "Espace formateur"}
      </p>
      <h1 className="font-display mt-1 text-3xl font-bold text-ink">Ma promo</h1>
      <p className="mt-2 text-slate-500">
        {data?.parcoursNom} — suivi de la progression de tes apprenants.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-500">Apprenants</p>
          <p className="font-display mt-1 text-3xl font-bold text-ink">
            {learners.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-500">
            Progression moyenne
          </p>
          <p className="font-display mt-1 text-3xl font-bold text-ink tabular-nums">
            {avg}%
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-500">Ont bien avancé</p>
          <p className="font-display mt-1 text-3xl font-bold text-ink tabular-nums">
            {learners.filter((l) => l.progression >= 50).length}
            <span className="text-lg font-semibold text-slate-400">
              {" "}
              / {learners.length}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {learners.length === 0 ? (
          <p className="p-8 text-center text-slate-500">
            Aucun apprenant inscrit sur ta promo pour l’instant.
          </p>
        ) : (
          learners.map((l, i) => (
            <Link
              key={l.profilId}
              href={`/formateur/apprenants/${l.profilId}`}
              className={[
                "flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50",
                i < learners.length - 1 ? "border-b border-slate-100" : "",
              ].join(" ")}
            >
              <div className="grid h-11 w-11 flex-none place-items-center rounded-full bg-gradient-to-br from-teal to-[#00b0f0] text-sm font-bold text-white">
                {`${l.prenom?.[0] ?? ""}${l.nom?.[0] ?? ""}`.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">
                  {l.prenom} {l.nom}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {l.currentTitre
                    ? `En cours : ${l.currentCode ? l.currentCode + " · " : ""}${l.currentTitre}`
                    : "Parcours terminé ou non démarré"}
                </p>
              </div>
              <div className="hidden w-52 sm:block">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-teal"
                      style={{ width: `${l.progression}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-bold tabular-nums text-slate-700">
                    {l.progression}%
                  </span>
                </div>
                <p className="mt-1 text-right text-[11px] text-slate-400">
                  {l.done}/{l.total} étapes
                </p>
              </div>
              <svg viewBox="0 0 24 24" className="h-5 w-5 flex-none text-slate-300" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
