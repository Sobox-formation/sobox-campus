"use client";

import { useState } from "react";
import Link from "next/link";
import { saveQuestionnaire } from "@/app/admin/actions";
import type { QuestionnaireEdit } from "@/lib/admin";

let COUNTER = 1;
const uid = () => `k${COUNTER++}`;

const TYPES = [
  { value: "binaire", label: "Vrai / Faux" },
  { value: "echelle", label: "Échelle" },
  { value: "choix", label: "Choix (a/b/c/d)" },
];

type Dim = { _k: string; code: string; libelle: string; score_max: string };
type Opt = { _k: string; texte: string; poids: string; dimensionCode: string };
type Ques = {
  _k: string;
  texte: string;
  type: string;
  inverse: boolean;
  dimensionCode: string;
  options: Opt[];
};

const s = (v: unknown) => (v == null ? "" : String(v));

export default function QuestionnaireEditor({
  questionnaire,
}: {
  questionnaire: QuestionnaireEdit;
}) {
  const [titre, setTitre] = useState(questionnaire.titre);
  const [description, setDescription] = useState(s(questionnaire.description));
  const [categorie, setCategorie] = useState(s(questionnaire.categorie));
  const [actif, setActif] = useState(questionnaire.actif);
  const [dims, setDims] = useState<Dim[]>(
    questionnaire.dimensions.map((d) => ({
      _k: uid(),
      code: d.code,
      libelle: d.libelle,
      score_max: s(d.score_max),
    })),
  );
  const [questions, setQuestions] = useState<Ques[]>(
    questionnaire.questions.map((q) => ({
      _k: uid(),
      texte: q.texte,
      type: q.type,
      inverse: q.inverse,
      dimensionCode: s(q.dimensionCode),
      options: (q.options ?? []).map((o) => ({
        _k: uid(),
        texte: o.texte,
        poids: s(o.poids),
        dimensionCode: s(o.dimensionCode),
      })),
    })),
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const validDims = dims.filter((d) => d.code.trim() !== "");
  const input =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal";

  function patchQ(k: string, fn: (q: Ques) => Ques) {
    setQuestions((qs) => qs.map((q) => (q._k === k ? fn(q) : q)));
  }
  function moveQ(k: string, dir: -1 | 1) {
    setQuestions((qs) => {
      const i = qs.findIndex((q) => q._k === k);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= qs.length) return qs;
      const c = [...qs];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
  }

  const DimSelect = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-600 outline-none focus:border-teal"
    >
      <option value="">— dimension —</option>
      {validDims.map((d) => (
        <option key={d._k} value={d.code}>
          {d.libelle || d.code}
        </option>
      ))}
    </select>
  );

  async function onSave() {
    setSaving(true);
    setMsg(null);
    const meta = { titre: titre.trim(), description, categorie, actif };
    const dimensions = validDims.map((d) => ({
      code: d.code.trim(),
      libelle: d.libelle.trim() || d.code.trim(),
      score_max: parseInt(d.score_max) || 0,
    }));
    const qs = questions.map((q) => ({
      texte: q.texte.trim(),
      type: q.type,
      inverse: q.inverse,
      dimensionCode: q.type === "choix" ? null : q.dimensionCode || null,
      options:
        q.type === "choix"
          ? q.options
              .filter((o) => o.texte.trim() !== "")
              .map((o) => ({
                texte: o.texte.trim(),
                poids: parseInt(o.poids) || 1,
                dimensionCode: o.dimensionCode || null,
              }))
          : [],
    }));
    const res = await saveQuestionnaire(questionnaire.id, meta, dimensions, qs);
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
        href="/admin/questionnaires"
        className="text-sm font-semibold text-teal hover:underline"
      >
        ← Tous les questionnaires
      </Link>

      {/* Métadonnées */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
        <input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre du questionnaire"
          className="font-display block w-full border-0 border-b border-transparent px-0 text-2xl font-bold text-ink outline-none focus:border-teal"
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-500">
            Catégorie
            <input
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
              className={`mt-1 ${input}`}
            />
          </label>
          <label className="flex items-end gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={actif}
              onChange={(e) => setActif(e.target.checked)}
            />
            Actif
          </label>
          <label className="text-xs font-semibold text-slate-500 sm:col-span-2">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={`mt-1 resize-none ${input}`}
            />
          </label>
        </div>
      </div>

      {/* Dimensions */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-display text-lg font-bold text-ink">
          Dimensions du profil
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Les axes mesurés (ex. fuite, attaque…). Le « code » est la clé
          technique, le « libellé » l’affichage. Le score max sert aux barres de
          résultat.
        </p>
        <div className="mt-3 space-y-2">
          {dims.map((d) => (
            <div key={d._k} className="flex items-center gap-2">
              <input
                value={d.code}
                onChange={(e) =>
                  setDims((ds) =>
                    ds.map((x) =>
                      x._k === d._k ? { ...x, code: e.target.value } : x,
                    ),
                  )
                }
                placeholder="code"
                className="w-32 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600 outline-none focus:border-teal"
              />
              <input
                value={d.libelle}
                onChange={(e) =>
                  setDims((ds) =>
                    ds.map((x) =>
                      x._k === d._k ? { ...x, libelle: e.target.value } : x,
                    ),
                  )
                }
                placeholder="Libellé affiché"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-teal"
              />
              <input
                value={d.score_max}
                onChange={(e) =>
                  setDims((ds) =>
                    ds.map((x) =>
                      x._k === d._k ? { ...x, score_max: e.target.value } : x,
                    ),
                  )
                }
                placeholder="max"
                inputMode="numeric"
                className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-teal"
              />
              <button
                type="button"
                onClick={() => setDims((ds) => ds.filter((x) => x._k !== d._k))}
                className="rounded px-1.5 text-slate-300 hover:text-rose"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setDims((ds) => [
              ...ds,
              { _k: uid(), code: "", libelle: "", score_max: "" },
            ])
          }
          className="mt-2.5 text-xs font-semibold text-teal hover:underline"
        >
          + Ajouter une dimension
        </button>
      </div>

      {/* Questions */}
      <div className="mt-6 space-y-4">
        {questions.map((q, qi) => (
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
              {q.type !== "choix" && (
                <>
                  <DimSelect
                    value={q.dimensionCode}
                    onChange={(v) =>
                      patchQ(q._k, (x) => ({ ...x, dimensionCode: v }))
                    }
                  />
                  <label className="flex items-center gap-1 text-xs text-slate-500">
                    <input
                      type="checkbox"
                      checked={q.inverse}
                      onChange={(e) =>
                        patchQ(q._k, (x) => ({ ...x, inverse: e.target.checked }))
                      }
                    />
                    inversé
                  </label>
                </>
              )}
              <div className="ml-auto flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => moveQ(q._k, -1)}
                  className="rounded px-1.5 py-0.5 hover:bg-slate-100"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveQ(q._k, 1)}
                  className="rounded px-1.5 py-0.5 hover:bg-slate-100"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setQuestions((qs) => qs.filter((x) => x._k !== q._k))
                  }
                  className="rounded px-1.5 py-0.5 text-rose hover:bg-rose/10"
                >
                  ✕
                </button>
              </div>
            </div>

            <textarea
              value={q.texte}
              onChange={(e) =>
                patchQ(q._k, (x) => ({ ...x, texte: e.target.value }))
              }
              placeholder="Énoncé / affirmation"
              rows={2}
              className="mt-3 block w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-ink outline-none focus:border-teal"
            />

            {q.type === "choix" && (
              <div className="mt-3 space-y-2">
                {q.options.map((o) => (
                  <div key={o._k} className="flex items-center gap-2">
                    <input
                      value={o.texte}
                      onChange={(e) =>
                        patchQ(q._k, (x) => ({
                          ...x,
                          options: x.options.map((oo) =>
                            oo._k === o._k
                              ? { ...oo, texte: e.target.value }
                              : oo,
                          ),
                        }))
                      }
                      placeholder="Réponse…"
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-teal"
                    />
                    <DimSelect
                      value={o.dimensionCode}
                      onChange={(v) =>
                        patchQ(q._k, (x) => ({
                          ...x,
                          options: x.options.map((oo) =>
                            oo._k === o._k ? { ...oo, dimensionCode: v } : oo,
                          ),
                        }))
                      }
                    />
                    <input
                      value={o.poids}
                      onChange={(e) =>
                        patchQ(q._k, (x) => ({
                          ...x,
                          options: x.options.map((oo) =>
                            oo._k === o._k
                              ? { ...oo, poids: e.target.value }
                              : oo,
                          ),
                        }))
                      }
                      placeholder="pts"
                      inputMode="numeric"
                      className="w-14 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-teal"
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
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    patchQ(q._k, (x) => ({
                      ...x,
                      options: [
                        ...x.options,
                        { _k: uid(), texte: "", poids: "1", dimensionCode: "" },
                      ],
                    }))
                  }
                  className="text-xs font-semibold text-teal hover:underline"
                >
                  + Ajouter une réponse
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          setQuestions((qs) => [
            ...qs,
            {
              _k: uid(),
              texte: "",
              type: "binaire",
              inverse: false,
              dimensionCode: "",
              options: [],
            },
          ])
        }
        className="mt-4 w-full rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-500 transition hover:border-teal hover:text-teal"
      >
        + Ajouter une question
      </button>

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
          {validDims.length} dim. · {questions.length} q.
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
