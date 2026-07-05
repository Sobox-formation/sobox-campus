"use client";

import { useState } from "react";
import { replyToLearner } from "@/app/formateur/actions";
import type { Conversation } from "@/lib/formateur";

type Msg = { expediteur: string; contenu: string; creeLe: string };

export default function FormateurMessages({
  conversations,
}: {
  conversations: Conversation[];
}) {
  const [convos, setConvos] = useState(conversations);
  const [selectedId, setSelectedId] = useState(
    conversations[0]?.inscriptionId ?? null,
  );
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const selected = convos.find((c) => c.inscriptionId === selectedId) ?? null;

  async function send() {
    const text = input.trim();
    if (!text || !selected || busy) return;
    setInput("");
    setBusy(true);
    const optimistic: Msg = { expediteur: "formateur", contenu: text, creeLe: "" };
    setConvos((cur) =>
      cur.map((c) =>
        c.inscriptionId === selected.inscriptionId
          ? { ...c, messages: [...c.messages, optimistic] }
          : c,
      ),
    );
    await replyToLearner(selected.inscriptionId, text);
    setBusy(false);
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Aucun message pour l’instant. Tes apprenants pourront t’écrire depuis
        leur espace « Willy &amp; formateurs ».
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      {/* Liste des conversations */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {convos.map((c) => {
          const last = c.messages[c.messages.length - 1];
          const active = c.inscriptionId === selectedId;
          return (
            <button
              key={c.inscriptionId}
              onClick={() => setSelectedId(c.inscriptionId)}
              className={[
                "flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition",
                active ? "bg-teal/5" : "hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-gradient-to-br from-teal to-[#00b0f0] text-xs font-bold text-white">
                {c.learnerName
                  .split(" ")
                  .map((x) => x[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {c.learnerName}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {last?.contenu ?? ""}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Thread */}
      <div className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {selected ? (
          <>
            <div className="border-b border-slate-200 px-5 py-3.5">
              <p className="font-display font-bold text-ink">
                {selected.learnerName}
              </p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {selected.messages.map((m, i) => {
                const isFormateur = m.expediteur === "formateur";
                return (
                  <div
                    key={i}
                    className={["flex max-w-[80%] gap-2.5", isFormateur ? "ml-auto flex-row-reverse" : ""].join(" ")}
                  >
                    <div
                      className={[
                        "whitespace-pre-wrap rounded-2xl border px-3.5 py-2.5 text-sm leading-relaxed",
                        isFormateur
                          ? "border-teal bg-teal text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700",
                      ].join(" ")}
                    >
                      {m.contenu}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2.5 border-t border-slate-200 p-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={`Répondre à ${selected.learnerName}…`}
                className="flex-1 rounded-xl border border-slate-200 bg-background px-4 py-3 text-sm outline-none focus:border-teal focus:bg-white"
              />
              <button
                onClick={send}
                disabled={busy || !input.trim()}
                className="rounded-xl bg-teal px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-dark disabled:opacity-50"
              >
                Envoyer
              </button>
            </div>
          </>
        ) : (
          <div className="grid flex-1 place-items-center text-sm text-slate-400">
            Sélectionne une conversation
          </div>
        )}
      </div>
    </div>
  );
}
