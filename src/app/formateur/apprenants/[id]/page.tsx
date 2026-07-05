import Link from "next/link";
import { getApprenantDetail } from "@/lib/formateur";

const STATUT: Record<string, { label: string; cls: string }> = {
  termine: { label: "Terminé", cls: "bg-emerald-50 text-emerald-600" },
  en_cours: { label: "En cours", cls: "bg-orange/10 text-orange" },
  disponible: { label: "Disponible", cls: "bg-teal/10 text-teal-dark" },
  verrouille: { label: "À venir", cls: "bg-slate-100 text-slate-400" },
};

export default async function ApprenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const d = await getApprenantDetail(id);

  if (!d) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="font-display text-lg font-bold text-ink">
          Apprenant introuvable
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Cet apprenant n’existe pas ou ne fait pas partie de ta promo.
        </p>
        <Link href="/formateur" className="mt-4 inline-flex text-sm font-semibold text-teal hover:underline">
          ← Retour à ma promo
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/formateur" className="text-sm font-semibold text-teal hover:underline">
        ← Ma promo
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-teal to-[#00b0f0] text-lg font-bold text-white">
          {`${d.profil.prenom?.[0] ?? ""}${d.profil.nom?.[0] ?? ""}`.toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            {d.profil.prenom} {d.profil.nom}
          </h1>
          <p className="text-sm text-slate-500">{d.profil.email}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-display text-3xl font-bold text-ink tabular-nums">
            {d.progression}%
          </p>
          <p className="text-xs text-slate-400">{d.parcoursNom}</p>
        </div>
      </div>

      {/* Étapes */}
      <h2 className="font-display mt-8 text-lg font-bold text-ink">
        Progression du parcours
      </h2>
      <ol className="mt-3 space-y-2">
        {d.modules.map((m, i) => {
          const s = STATUT[m.statut] ?? STATUT.verrouille;
          return (
            <li
              key={i}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-slate-100 font-display text-xs font-bold text-slate-500">
                {m.code}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{m.titre}</p>
                {m.periode && <p className="text-xs text-slate-400">{m.periode}</p>}
              </div>
              <span className={`flex-none rounded-full px-3 py-1 text-xs font-semibold ${s.cls}`}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Quiz */}
        <section>
          <h2 className="font-display text-lg font-bold text-ink">
            Quiz de validation
          </h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {d.quiz.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">Aucun quiz passé.</p>
            ) : (
              d.quiz.map((q, i) => (
                <div
                  key={i}
                  className={[
                    "flex items-center gap-3 px-4 py-3",
                    i < d.quiz.length - 1 ? "border-b border-slate-100" : "",
                  ].join(" ")}
                >
                  <span
                    className={`grid h-7 w-7 flex-none place-items-center rounded-full text-xs font-bold ${q.reussi ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
                  >
                    {q.reussi ? "✓" : "–"}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {q.titre}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-slate-600">
                    {q.score}%
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Soft skills */}
        <section>
          <h2 className="font-display text-lg font-bold text-ink">Soft skills</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {d.soft.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">
                Aucun bilan soft skills.
              </p>
            ) : (
              d.soft.map((s, i) => (
                <div
                  key={i}
                  className={[
                    "flex items-center justify-between gap-3 px-4 py-3",
                    i < d.soft.length - 1 ? "border-b border-slate-100" : "",
                  ].join(" ")}
                >
                  <span className="text-sm text-ink">{s.titre}</span>
                  <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-bold text-teal-dark">
                    {s.profilDominant ?? "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
