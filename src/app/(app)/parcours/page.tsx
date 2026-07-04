import { getParcoursData } from "@/lib/parcours";
import ParcoursTimeline from "@/components/parcours-timeline";

const STATUT_BADGE: Record<string, { label: string; cls: string }> = {
  termine: { label: "Terminé", cls: "bg-emerald-50 text-emerald-600" },
  en_cours: { label: "En cours", cls: "bg-orange/10 text-orange" },
  disponible: { label: "Disponible", cls: "bg-teal/10 text-teal-dark" },
  verrouille: { label: "À venir", cls: "bg-slate-100 text-slate-400" },
};

export default async function ParcoursPage() {
  const data = await getParcoursData();
  const parcours = data?.parcours;

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-teal">
        {parcours?.client ?? "Mon parcours"}
      </p>
      <h1 className="font-display mt-1 text-3xl font-bold text-ink">
        {parcours?.nom ?? "Mon parcours"}
      </h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Tes étapes se débloquent au fil des journées présentielles. Après chaque
        formation, tu retrouves ici ta capsule, ta fiche mémo et ton quiz de
        validation.
      </p>

      {!parcours ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Aucun parcours attribué pour l’instant.
        </div>
      ) : (
        <>
          <section className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-ink">
                Vue d’ensemble
              </h3>
              <a
                href="/brand/parcours-fer-a-cheval.png"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-teal hover:underline"
              >
                Voir le schéma complet ↗
              </a>
            </div>
            <div className="mt-3">
              <ParcoursTimeline steps={data?.steps ?? []} />
            </div>
          </section>

          <section className="mt-8">
            <h3 className="font-display text-lg font-bold text-ink">
              Toutes les étapes
            </h3>
            <ol className="mt-4 space-y-3">
              {data?.modules.map((m) => {
                const badge =
                  STATUT_BADGE[m.statut] ?? STATUT_BADGE.verrouille;
                return (
                  <li
                    key={m.id}
                    className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-teal/40"
                  >
                    <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-slate-100 font-display text-sm font-bold text-slate-500">
                      {m.code ?? m.ordre}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{m.titre}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {[m.periode, m.lieu].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span
                      className={`flex-none rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}
