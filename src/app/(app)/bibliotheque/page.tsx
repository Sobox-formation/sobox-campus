import { getBibliotheque, type BiblioResource } from "@/lib/parcours";

const TYPE_META: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  video: {
    label: "Capsule",
    color: "#00B0F0",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    ),
  },
  pdf: {
    label: "Fiche mémo",
    color: "#2B7A85",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M6 2h8l4 4v16H6z" />
        <path d="M14 2v4h4M9 13h6M9 17h6" />
      </svg>
    ),
  },
  fiche_memo: {
    label: "Fiche mémo",
    color: "#2B7A85",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M6 2h8l4 4v16H6z" />
        <path d="M14 2v4h4M9 13h6M9 17h6" />
      </svg>
    ),
  },
  lien: {
    label: "Lien",
    color: "#F49716",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
        <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
      </svg>
    ),
  },
  carnet: {
    label: "Carnet",
    color: "#E94168",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
        <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
      </svg>
    ),
  },
};

const STATUT_BADGE: Record<string, { label: string; cls: string }> = {
  termine: { label: "Terminé", cls: "bg-emerald-50 text-emerald-600" },
  en_cours: { label: "En cours", cls: "bg-orange/10 text-orange" },
  disponible: { label: "Disponible", cls: "bg-teal/10 text-teal-dark" },
  verrouille: { label: "Verrouillé", cls: "bg-slate-100 text-slate-400" },
};

function ResourceCard({
  r,
  locked,
}: {
  r: BiblioResource;
  locked: boolean;
}) {
  const meta = TYPE_META[r.type] ?? TYPE_META.pdf;
  return (
    <div
      className={[
        "flex flex-col rounded-xl border border-slate-200 bg-white p-4",
        locked ? "opacity-70" : "transition hover:-translate-y-0.5 hover:border-teal/40",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span
          className="grid h-8 w-8 place-items-center rounded-lg"
          style={{ background: `${meta.color}1a`, color: meta.color }}
        >
          {meta.icon}
        </span>
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
          {meta.label}
        </span>
      </div>
      <h4 className="mt-2.5 text-sm font-semibold leading-snug text-ink">
        {r.titre}
      </h4>
      {r.description && (
        <p className="mt-1 text-xs text-slate-500">{r.description}</p>
      )}
      <div className="mt-auto pt-3">
        {locked ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            Verrouillé
          </span>
        ) : (
          <a
            href={r.url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal px-3 py-1.5 text-xs font-bold text-white transition hover:bg-teal-dark"
          >
            Ouvrir →
          </a>
        )}
      </div>
    </div>
  );
}

export default async function BibliothequePage() {
  const data = await getBibliotheque();
  const parcours = data?.parcours;

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-teal">
        Ta Box, en version numérique
      </p>
      <h1 className="font-display mt-1 text-3xl font-bold text-ink">
        Ma Box &amp; ressources
      </h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Tes supports, capsules et fiches mémos, débloqués au fil de ta
        progression. Les ressources d’un module verrouillé se révèlent une fois
        l’étape précédente terminée.
      </p>

      {!parcours ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Aucun parcours attribué pour l’instant.
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {data?.groups.map((g) => {
            const badge = g.statut !== "parcours" ? STATUT_BADGE[g.statut] : null;
            return (
              <section key={g.moduleId ?? "parcours"}>
                <div className="flex flex-wrap items-center gap-3">
                  {g.code && (
                    <span className="grid h-9 min-w-9 place-items-center rounded-lg bg-slate-100 px-2 font-display text-sm font-bold text-slate-500">
                      {g.code}
                    </span>
                  )}
                  <h3 className="font-display text-lg font-bold text-ink">
                    {g.titre}
                  </h3>
                  {badge && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>
                {g.locked && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Ces ressources se débloqueront une fois l’étape précédente
                    terminée.
                  </p>
                )}
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {g.resources.map((r) => (
                    <ResourceCard key={r.id} r={r} locked={g.locked} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
