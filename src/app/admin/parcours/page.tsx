import Link from "next/link";
import { getAdminParcoursList } from "@/lib/admin";
import NewParcoursButton from "@/components/new-parcours-button";

export default async function AdminParcoursListPage() {
  const parcours = await getAdminParcoursList();

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal">
            Administration
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold text-ink">
            Parcours de formation
          </h1>
          <p className="mt-2 text-slate-500">
            Construis un parcours pour n’importe quel client : modules, ordre,
            évaluations. Réutilisable à volonté.
          </p>
        </div>
        <NewParcoursButton />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {parcours.length === 0 && (
          <p className="text-sm text-slate-400">
            Aucun parcours. Clique « + Nouveau parcours » pour commencer.
          </p>
        )}
        {parcours.map((p) => (
          <Link
            key={p.id}
            href={`/admin/parcours/${p.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-teal hover:shadow-sm"
          >
            <div className="flex items-center gap-2">
              {p.client && (
                <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-bold text-teal-dark">
                  {p.client}
                </span>
              )}
              {!p.actif && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-400">
                  Inactif
                </span>
              )}
            </div>
            <h3 className="font-display mt-2 text-lg font-bold text-ink">
              {p.nom}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {p.nbModules} module{p.nbModules > 1 ? "s" : ""} ·{" "}
              {p.nbInscrits} inscrit{p.nbInscrits > 1 ? "s" : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
