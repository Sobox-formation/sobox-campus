"use client";

import { useEffect, useRef, useState } from "react";
import { sendFormateurMessage } from "@/app/(app)/assistant/actions";
import type { ChatMessage, FormateurMessage } from "@/lib/messages";

function RobotAvatar() {
  return (
    <svg viewBox="0 0 120 120" className="h-32 w-32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="60" y1="18" x2="60" y2="30" stroke="#00B0F0" strokeWidth={3} />
      <circle cx="60" cy="14" r="5" fill="#F49716" />
      <rect x="26" y="30" width="68" height="56" rx="18" fill="#E4F0F1" />
      <rect x="34" y="44" width="52" height="30" rx="12" fill="#0C2A30" />
      <circle cx="50" cy="59" r="5" fill="#F49716" />
      <circle cx="70" cy="59" r="5" fill="#F49716" />
      <path d="M52 68 q8 5 16 0" stroke="#00B0F0" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <rect x="44" y="92" width="32" height="16" rx="8" fill="#E4F0F1" />
      <rect x="18" y="52" width="8" height="20" rx="4" fill="#2B7A85" />
      <rect x="94" y="52" width="8" height="20" rx="4" fill="#2B7A85" />
    </svg>
  );
}

export default function AssistantChat({
  prenom,
  initialWilly,
  initialFormateur,
}: {
  prenom: string;
  initialWilly: ChatMessage[];
  initialFormateur: FormateurMessage[];
}) {
  const [mode, setMode] = useState<"willy" | "formateur">("willy");
  const [willy, setWilly] = useState<ChatMessage[]>(
    initialWilly.length
      ? initialWilly
      : [
          {
            role: "assistant",
            content: `Salut ${prenom || ""} 👋 Moi c'est Willy, ton copilote. Pose-moi une question sur ton parcours, tes contenus ou ta progression — on avance ensemble 🚀`,
          },
        ],
  );
  const [formateur, setFormateur] = useState<FormateurMessage[]>(initialFormateur);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight });
  }, [willy, formateur, mode]);

  async function submit() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");

    if (mode === "willy") {
      const next: ChatMessage[] = [...willy, { role: "user", content: text }];
      setWilly(next);
      setBusy(true);
      try {
        const res = await fetch("/api/willy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next }),
        });
        const data = await res.json();
        setWilly((cur) => [
          ...cur,
          {
            role: "assistant",
            content:
              data.reply ??
              data.error ??
              "Désolé, une erreur est survenue. Réessaie.",
          },
        ]);
      } catch {
        setWilly((cur) => [
          ...cur,
          { role: "assistant", content: "Connexion interrompue. Réessaie." },
        ]);
      } finally {
        setBusy(false);
      }
    } else {
      setBusy(true);
      setFormateur((cur) => [
        ...cur,
        { expediteur: "apprenant", contenu: text, creeLe: "" },
      ]);
      const r = await sendFormateurMessage(text);
      setBusy(false);
      if (r.ok) {
        setFormateur((cur) => [
          ...cur,
          {
            expediteur: "systeme",
            contenu:
              "📨 Message transmis à ton formateur référent. Il te répondra ici (réponse humaine sous 2h ouvrées en général).",
            creeLe: "",
          },
        ]);
      }
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* En-tête + onglets */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-teal to-[#00b0f0] text-sm font-bold text-white">
            W
          </div>
          <div>
            <p className="font-display text-sm font-bold text-ink">
              {mode === "willy" ? "Willy" : "Tes formateurs"}
            </p>
            <p className="text-xs font-semibold text-emerald-600">● En ligne</p>
          </div>
          <div className="ml-auto flex gap-1 rounded-xl bg-slate-100 p-1">
            {(["willy", "formateur"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={[
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  mode === m ? "bg-white text-ink shadow" : "text-slate-500",
                ].join(" ")}
              >
                {m === "willy" ? "Willy (IA)" : "Formateurs"}
              </button>
            ))}
          </div>
        </div>

        {/* Fil */}
        <div ref={streamRef} className="flex-1 space-y-3.5 overflow-y-auto p-5">
          {mode === "willy"
            ? willy.map((m, i) => <Bubble key={i} who={m.role} text={m.content} />)
            : formateur.length === 0
              ? (
                  <p className="mt-4 text-center text-sm text-slate-400">
                    Aucun message. Écris à tes formateurs — ils te répondront ici.
                  </p>
                )
              : formateur.map((m, i) => (
                  <Bubble
                    key={i}
                    who={m.expediteur === "apprenant" ? "user" : "assistant"}
                    text={m.contenu}
                    system={m.expediteur === "systeme"}
                  />
                ))}
          {busy && mode === "willy" && (
            <Bubble who="assistant" text="Willy réfléchit…" muted />
          )}
        </div>

        {/* Saisie */}
        <div className="flex items-center gap-2.5 border-t border-slate-200 p-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={
              mode === "willy"
                ? "Écris ta question à Willy…"
                : "Écris à tes formateurs…"
            }
            className="flex-1 rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm outline-none focus:border-teal focus:bg-white"
          />
          <button
            onClick={submit}
            disabled={busy || !input.trim()}
            className="grid h-11 w-11 place-items-center rounded-xl bg-teal text-white transition hover:bg-teal-dark disabled:opacity-50"
            aria-label="Envoyer"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Carte Willy */}
      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#124651] to-[#0C2A30] p-6 text-center text-white">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(240px 160px at 50% 0%, rgba(244,151,22,.4), transparent 65%)",
            }}
          />
          <div className="relative mx-auto flex justify-center">
            <RobotAvatar />
          </div>
          <h3 className="font-display relative mt-1 text-lg font-bold">
            Willy, ton copilote
          </h3>
          <p className="relative mt-2 text-sm text-[#9FC0C4]">
            Je te guide dans le parcours, je réponds sur tes contenus, et je passe
            le relais aux formateurs quand il faut.
          </p>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Willy s’appuie sur l’IA Claude. Tes échanges avec les formateurs leur
          sont transmis.
        </p>
      </div>
    </div>
  );
}

function Bubble({
  who,
  text,
  muted,
  system,
}: {
  who: "user" | "assistant";
  text: string;
  muted?: boolean;
  system?: boolean;
}) {
  const isUser = who === "user";
  return (
    <div
      className={[
        "flex max-w-[85%] gap-2.5",
        isUser ? "ml-auto flex-row-reverse" : "",
      ].join(" ")}
    >
      <div
        className={[
          "grid h-8 w-8 flex-none place-items-center rounded-lg text-xs font-bold text-white",
          isUser
            ? "bg-gradient-to-br from-orange to-[#d97f08]"
            : "bg-gradient-to-br from-teal to-[#00b0f0]",
        ].join(" ")}
      >
        {isUser ? "Moi" : "W"}
      </div>
      <div
        className={[
          "whitespace-pre-wrap rounded-2xl border px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "border-teal bg-teal text-white"
            : system
              ? "border-teal/20 bg-teal/10 text-teal-dark"
              : "border-slate-200 bg-slate-50 text-slate-700",
          muted ? "italic text-slate-400" : "",
        ].join(" ")}
      >
        {text}
      </div>
    </div>
  );
}
