"use client";

import { useState } from "react";
import Link from "next/link";
import { saveQuiz } from "@/app/admin/actions";
import type { QuizEdit } from "@/lib/admin";

let COUNTER = 1;
const uid = () => `k${COUNTER++}`;

type Opt = { _k: string; libelle: string; est_correcte: boolean };
type Ques = { _k: string; enonce: string; type: string; options: Opt[] };

const TYPES: { value: string; label: string }[] = [
  { value: "qcm_unique", label: "Choix unique" },
  { value: "qcm_multiple", label: "Choix multiple" },
  { value: "vrai_faux", label: "Vrai / Faux" },
];

export default function QuizEditor({ quiz }: { quiz: QuizEdit }) {
  const [titre, setTitre] = useState(quiz.titre);
  const [description, setDescription] = useState(quiz.description ?? "");
  const [seuil, setSeuil] = useState(quiz.seuil);
  const [questions, setQuestions] = useState<Ques[]>(
    quiz.questions.map((q) => ({
      _k: uid(),
      enonce: q.enonce,
      type: q.type,
      options: q.options.map((o) => ({
        _k: uid(),
        libelle: o.libelle,
        est_correcte: o.est_correcte,
      })),
    })),
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function patchQ(k: string, fn: (q: Ques) => Ques) {
    setQuestions((qs) => qs.map((q) => (q._k === k ? fn(q) : q)));
  }

  function addQuestion() {
    setQuestions((qs) => [
      ...qs,
      {
        _k: uid(),
        enonce: "",
        type: "qcm_unique",
        options: [
          { _k: uid(), libelle: "", est_correcte: false },
          { _k: uid(), libelle: "", est_correcte: false },
        ],
      },
    ]);
  }

  function move(k: string, dir: -1 | 1) {
    setQuestions((qs) => {
      const i = qs.findIndex((q) => q._k === k);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= qs.length) return qs;
      const copy = [...qs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  function setCorrect(qk: string, ok: string, multiple: boolean) {
    patchQ(qk, (q) => ({
      ...q,
      options: q.options.map((o) =>
        o._k === ok
          ? { ...o, est_correcte: multiple ? !o.est_correcte : true }
          : { ...o, est_correcte: multiple ? o.est_correcte : false },
      ),
    }));
  }

  async function onSave() {
    setSaving(true);
    setMsg(null);
    const payload = questions.map((q) => ({
      enonce: q.enonce.trim(),
      type: q.type,
      options: q.options
        .filter((o) => o.libelle.trim() !== "")
        .map((o) => ({ libelle: o.libelle.trim(), est_correcte: o.est_correcte })),
    }));
    const res = await saveQuiz(quiz.id, titre.trim(), description, seuil, payload);
    setSaving(false);
    setMsg(
      res.ok
        ? { ok: true, text: "Enregistré ✓" }
        : { ok: false, text: "Erreur : " + (res.error ?? "échec") },
    );
  }

  return (
    <div>
      <Link
        href="/admin/quiz"
        className="text-sm font-semibold text-teal hover:underline"
      >
        ← Tous les quiz
      </Link>

      {/* Entête quiz */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
        {quiz.moduleCode && (
          <span className="inline-block rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
            Module {quiz.moduleCode}
          </span>
        )}
        <input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre du quiz"
          className="font-display mt-2 block w-full border-0 border-b border-transparent px-0 text-2xl font-bold text-ink outline-none focus:border-teal"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (facultative)"
          rows={2}
          className="mt-2 block w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal"
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          Seuil de réussite
          <input
            type="number"
            min={0}
            max={100}
            value={seuil}
            onChange={(e) => setSeuil(Number(e.target.value))}
            className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-teal"
          />
          %
        </label>
      </div>

      {/* Questions */}
      <div className="mt-5 space-y-4">
        {questions.map((q, qi) => {
          const multiple = q.type === "qcm_multiple";
          return (
            <div
              key={q._k}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-teal/10 text-xs font-bold text-teal-dark">
                  {qi + 1}
                </span>
                <select
                  value={q.type}
                  onChange={(e) =>
                    patchQ(q._k, (x) => ({ ...x, type: e.target.value }))
                  }
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 outline-none focus:border-teal"
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="ml-auto flex items-center gap-1 text-slate-400">
                  <button
                    type="button"
                    onClick={() => move(q._k, -1)}
                    className="rounded px-1.5 py-0.5 hover:bg-slate-100"
                    title="Monter"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(q._k, 1)}
                    className="rounded px-1.5 py-0.5 hover:bg-slate-100"
                    title="Descendre"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuestions((qs) => qs.filter((x) => x._k !== q._k))
                    }
                    className="rounded px-1.5 py-0.5 text-rose hover:bg-rose/10"
                    title="Supprimer la question"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <textarea
                value={q.enonce}
                onChange={(e) =>
                  patchQ(q._k, (x) => ({ ...x, enonce: e.target.value }))
                }
                placeholder="Énoncé de la question"
                rows={2}
                className="mt-3 block w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-ink outline-none focus:border-teal"
              />

              <div className="mt-3 space-y-2">
                {q.options.map((o) => (
                  <div key={o._k} className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCorrect(q._k, o._k, multiple)}
                      className={[
                        "grid h-5 w-5 flex-none place-items-center border text-[11px] font-bold transition",
                        multiple ? "rounded" : "rounded-full",
                        o.est_correcte
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 text-transparent hover:border-emerald-400",
                      ].join(" ")}
                      title="Marquer comme bonne réponse"
                    >
                      ✓
                    </button>
                    <input
                      value={o.libelle}
                      onChange={(e) =>
                        patchQ(q._k, (x) => ({
                          ...x,
                          options: x.options.map((oo) =>
                            oo._k === o._k
                              ? { ...oo, libelle: e.target.value }
                              : oo,
                          ),
                        }))
                      }
                      placeholder="Réponse…"
                      className={[
                        "flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-teal",
                        o.est_correcte
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-slate-200",
                      ].join(" ")}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        patchQ(q._k, (x) => ({
                          ...x,
                          options: x.options.filter((oo) => oo._k !== o._k),
                        }))
                      }
                      className="rounded px-1.5 text-slate-300 hover:text-rose"
                      title="Supprimer la réponse"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  patchQ(q._k, (x) => ({
                    ...x,
                    options: [
                      ...x.options,
                      { _k: uid(), libelle: "", est_correcte: false },
                    ],
                  }))
                }
                className="mt-2.5 text-xs font-semibold text-teal hover:underline"
              >
                + Ajouter une réponse
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addQuestion}
        className="mt-4 w-full rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-500 transition hover:border-teal hover:text-teal"
      >
        + Ajouter une question
      </button>

      {/* Barre d'enregistrement */}
      <div className="sticky bottom-4 mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-xl bg-teal px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-dark disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        <span className="text-xs text-slate-400">
          {questions.length} question{questions.length > 1 ? "s" : ""}
        </span>
        {msg && (
          <span
            className={[
              "ml-auto text-sm font-semibold",
              msg.ok ? "text-emerald-600" : "text-rose",
            ].join(" ")}
          >
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
