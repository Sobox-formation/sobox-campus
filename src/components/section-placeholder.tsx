export default function SectionPlaceholder({
  eyebrow,
  titre,
  description,
  bientot,
}: {
  eyebrow: string;
  titre: string;
  description: string;
  bientot: string[];
}) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-teal">
        {eyebrow}
      </p>
      <h1 className="font-display mt-1 text-3xl font-bold text-ink">{titre}</h1>
      <p className="mt-2 max-w-2xl text-slate-500">{description}</p>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8">
        <div className="flex items-center gap-2 text-teal">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal/10">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M12 8v4l3 2" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </span>
          <span className="font-display text-lg font-bold text-ink">
            Brique en construction
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Cette section arrive dans un prochain sprint. Voici ce qu’elle
          contiendra :
        </p>
        <ul className="mt-4 space-y-2">
          {bientot.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-orange" />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
