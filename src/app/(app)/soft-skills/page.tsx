import Link from "next/link";
import { getSoftSkills, type SoftSkillItem } from "@/lib/softskills";

const COLOR: Record<string, string> = {
  assertivite: "#E94168",
  disc: "#2B7A85",
  drivers: "#F49716",
  gestion_temps: "#00B0F0",
  confiance_soi: "#70AD47",
  marketing_soi: "#1f6570",
  ie: "#B44492",
  "180_manager": "#767171",
};

function Card({ q }: { q: SoftSkillItem }) {
  const color = COLOR[q.code] ?? "#2B7A85";
  const done = !!q.result;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div
        className="flex h-20 items-end p-4"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}bb)`,
        }}
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-white/95" fill="none" stroke="currentColor" strokeWidth={1.7}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
        </svg>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p
          className="text-[10.5px] font-bold uppercase tracking-wider"
          style={{ color: done ? "#059669" : "#94a3b8" }}
        >
          {done ? `Complété · ${q.result?.profilDominant ?? ""}` : "À faire"}
        </p>
        <h3 className="mt-1.5 font-semibold text-ink">{q.titre}</h3>
        {q.description && (
          <p className="mt-1 text-xs text-slate-500">{q.description}</p>
        )}
        <div className="mt-auto pt-4">
          {done ? (
            <Link
              href={`/soft-skills/${q.code}`}
              className="inline-flex rounded-lg bg-teal px-3 py-1.5 text-xs font-bold text-white transition hover:bg-teal-dark"
            >
              Voir le résultat →
            </Link>
          ) : q.source === "google_form" && q.formUrl ? (
            <a
              href={q.formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-lg border border-teal px-3 py-1.5 text-xs font-bold text-teal transition hover:bg-teal hover:text-white"
            >
              Répondre au questionnaire →
            </a>
          ) : (
            <span className="text-xs font-semibold text-slate-400">
              Bientôt disponible
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function SoftSkillsPage() {
  const items = await getSoftSkills();

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-teal">
        Mieux se connaître pour mieux manager
      </p>
      <h1 className="font-display mt-1 text-3xl font-bold text-ink">
        Tests &amp; soft skills
      </h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Les tests d’auto-positionnement de ton parcours. Chacun te restitue un
        profil détaillé pour mesurer et développer ta posture.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(items ?? []).map((q) => (
          <Card key={q.id} q={q} />
        ))}
      </div>
    </div>
  );
}
