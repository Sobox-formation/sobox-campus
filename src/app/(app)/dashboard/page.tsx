import Link from "next/link";
import { getParcoursData } from "@/lib/parcours";
import ParcoursTimeline from "@/components/parcours-timeline";

export default async function DashboardPage() {
  const data = await getParcoursData();
  const prenom = data?.profile?.prenom ?? "";
  const parcours = data?.parcours;

  const current =
    data?.modules.find((m) => m.statut === "en_cours") ??
    data?.modules.find((m) => m.statut === "disponible");

  const done = data?.modules.filter((m) => m.statut === "termine").length ?? 0;
  const total = data?.modules.length ?? 0;

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-teal">
        Bonjour {prenom} 👋
      </p>
      <h1 className="font-display mt-1 text-3xl font-bold text-ink">
        Ton tableau de bord
      </h1>

      {!parcours ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="font-display text-lg font-bold text-ink">
            Aucun parcours attribué pour l’instant
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Ton compte est bien créé. Ton formateur va t’inscrire à ton
            parcours — il apparaîtra ici automatiquement.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-5 md:grid-cols-[1.6fr_1fr]">
            {/* Prochaine étape */}
            <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-teal to-teal-dark p-7 text-white shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                {current ? `Prochaine étape · ${current.code ?? ""}` : "Parcours"}
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold">
                {current?.titre ?? parcours.nom}
              </h2>
              {current && (
                <p className="mt-2 text-sm text-white/80">
                  {[current.periode, current.lieu].filter(Boolean).join(" · ")}
                </p>
              )}
              <Link
                href="/parcours"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange px-4 py-2.5 text-sm font-bold text-[#3a2402] transition hover:brightness-105"
              >
                Ouvrir mon parcours →
              </Link>
            </section>

            {/* Progression */}
            <section className="rounded-2xl border border-slate-200 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {parcours.client ?? "Progression"}
              </p>
              <p className="font-display mt-2 text-4xl font-bold tabular-nums text-ink">
                {data?.progression ?? 0}%
              </p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-orange"
                  style={{ width: `${data?.progression ?? 0}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {done} étape{done > 1 ? "s" : ""} terminée{done > 1 ? "s" : ""} sur{" "}
                {total}
              </p>
            </section>
          </div>

          {/* Vue d'ensemble — frise dynamique */}
          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-ink">
                Vue d’ensemble du parcours
              </h3>
              <Link
                href="/parcours"
                className="text-sm font-semibold text-teal hover:underline"
              >
                Voir le détail →
              </Link>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Les étapes terminées sont grisées ; la vue se centre sur ton étape
              en cours.
            </p>
            <div className="mt-3">
              <ParcoursTimeline steps={data?.steps ?? []} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
