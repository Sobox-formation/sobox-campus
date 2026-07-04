"use client";

import { useEffect, useRef } from "react";

export type TimelineStep = {
  id: string;
  code: string;
  titre: string;
  periode: string | null;
  lieu: string | null;
  statut: "termine" | "en_cours" | "disponible" | "verrouille";
};

// Palette d'accents (reprend l'esprit multicolore du schéma d'origine)
const PALETTE = [
  "#2B7A85",
  "#83BD27",
  "#F49716",
  "#00B0F0",
  "#B44492",
  "#E94168",
  "#1f6570",
  "#70AD47",
];

const STATUT_LABEL: Record<TimelineStep["statut"], string> = {
  termine: "Terminé",
  en_cours: "En cours",
  disponible: "Disponible",
  verrouille: "À venir",
};

function StepCard({
  step,
  color,
  isCurrent,
}: {
  step: TimelineStep;
  color: string;
  isCurrent: boolean;
}) {
  const done = step.statut === "termine";
  const locked = step.statut === "verrouille";

  const accent = done ? "#94a3b8" : color;

  return (
    <div
      className={[
        "w-52 rounded-xl border bg-white p-3 text-left transition-all duration-300",
        isCurrent ? "scale-[1.06]" : "shadow-sm hover:-translate-y-0.5",
        done ? "opacity-60 grayscale" : "",
        locked ? "border-dashed opacity-55" : "",
      ].join(" ")}
      style={{
        borderColor: isCurrent ? accent : locked ? "#cbd5e1" : "#e2e8f0",
        boxShadow: isCurrent
          ? `0 0 0 2px ${accent}, 0 18px 40px -18px ${accent}`
          : undefined,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="grid h-7 min-w-7 place-items-center rounded-lg px-1.5 font-display text-xs font-bold text-white"
          style={{ background: accent }}
        >
          {step.code}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{
            color: done ? "#64748b" : accent,
            background: done ? "#f1f5f9" : `${accent}18`,
          }}
        >
          {STATUT_LABEL[step.statut]}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold leading-snug text-slate-800">
        {step.titre}
      </p>
      {(step.periode || step.lieu) && (
        <p className="mt-1 text-xs text-slate-500">
          {[step.periode, step.lieu].filter(Boolean).join(" · ")}
        </p>
      )}
    </div>
  );
}

export default function ParcoursTimeline({ steps }: { steps: TimelineStep[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  // Index de l'étape « focus » : celle en cours, sinon la 1re disponible, sinon la 1re verrouillée
  const currentIndex = (() => {
    const byStatus = (s: TimelineStep["statut"]) =>
      steps.findIndex((x) => x.statut === s);
    return [byStatus("en_cours"), byStatus("disponible"), byStatus("verrouille")]
      .filter((i) => i >= 0)
      .at(0) ?? 0;
  })();

  // Centre automatiquement la vue sur l'étape en cours
  useEffect(() => {
    const el = currentRef.current;
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target =
      el.offsetLeft - scroller.clientWidth / 2 + el.clientWidth / 2;
    scroller.scrollTo({
      left: Math.max(0, target),
      behavior: reduce ? "auto" : "smooth",
    });
  }, [currentIndex]);

  return (
    <div
      ref={scrollerRef}
      className="overflow-x-auto rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4"
    >
      <div className="flex min-w-max items-stretch px-6">
        {/* Départ */}
        <div className="flex flex-col items-center justify-center pr-2 text-slate-400">
          <span className="font-display text-sm font-bold">Start</span>
          <span className="mt-9 h-3 w-3 rounded-full bg-slate-300" />
        </div>

        {steps.map((step, i) => {
          const color = PALETTE[i % PALETTE.length];
          const isCurrent = i === currentIndex;
          const done = step.statut === "termine";
          const top = i % 2 === 0;
          const nodeColor = done ? "#cbd5e1" : color;

          return (
            <div
              key={step.id}
              ref={isCurrent ? currentRef : undefined}
              className="flex w-56 flex-none flex-col items-center"
            >
              {/* Carte au-dessus */}
              <div className="flex h-44 w-full items-end justify-center pb-1">
                {top && (
                  <StepCard step={step} color={color} isCurrent={isCurrent} />
                )}
              </div>

              {/* Tige haute */}
              <div className="h-4 w-px" style={{ background: top ? "#e2e8f0" : "transparent" }} />

              {/* Bande centrale : ligne + nœud */}
              <div className="relative flex h-8 w-full items-center justify-center">
                <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-slate-200" />
                <span
                  className={[
                    "relative z-10 grid place-items-center rounded-full text-white transition-all",
                    isCurrent ? "h-7 w-7" : "h-5 w-5",
                  ].join(" ")}
                  style={{
                    background: nodeColor,
                    boxShadow: isCurrent ? `0 0 0 4px ${color}44` : undefined,
                  }}
                >
                  {done ? (
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : isCurrent ? (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  ) : null}
                </span>
              </div>

              {/* Tige basse */}
              <div className="h-4 w-px" style={{ background: !top ? "#e2e8f0" : "transparent" }} />

              {/* Carte en dessous */}
              <div className="flex h-44 w-full items-start justify-center pt-1">
                {!top && (
                  <StepCard step={step} color={color} isCurrent={isCurrent} />
                )}
              </div>
            </div>
          );
        })}

        {/* Arrivée */}
        <div className="flex flex-col items-center justify-center pl-2 text-slate-400">
          <span className="font-display text-sm font-bold">Fin</span>
          <span className="mt-9 text-lg">🎓</span>
        </div>
      </div>
    </div>
  );
}
