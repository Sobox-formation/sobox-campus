"use client";

import { useState } from "react";
import Link from "next/link";
import { saveParcours } from "@/app/admin/actions";
import type { ParcoursEdit } from "@/lib/admin";

let COUNTER = 1;
const uid = () => `m${COUNTER++}`;

const MODULE_TYPES: { value: string; label: string }[] = [
  { value: "amont", label: "Amont" },
  { value: "presentiel", label: "Présentiel" },
  { value: "distanciel", label: "Distanciel" },
  { value: "autonomie", label: "Autonomie" },
  { value: "coaching", label: "Coaching" },
  { value: "jury", label: "Jury" },
];

type Mod = {
  _k: string;
  id?: string;
  code: string;
  titre: string;
  type: string;
  periode: string;
  duree_heures: string;
  objectifs: string;
  hasQuiz: boolean;
};

const s = (v: unknown) => (v == null ? "" : String(v));

export default function ParcoursEditor({ parcours }: { parcours: ParcoursEdit }) {
  const [nom, setNom] = useState(parcours.nom);
  const [client, setClient] = useState(s(parcours.client));
  const [code, setCode] = useState(parcours.code);
  const [description, setDescription] = useState(s(parcours.description));
  const [format, setFormat] = useState(s(parcours.format));
  const [dateDebut, setDateDebut] = useState(s(parcours.date_debut));
  const [dateFin, setDateFin] = useState(s(parcours.date_fin));
  const [actif, setActif] = useState(parcours.actif);
  const [modules, setModules] = useState<Mod[]>(
    parcours.modules.map((m) => ({
      _k: uid(),
      id: m.id,
      code: s(m.code),
      titre: m.titre,
      type: m.type,
      periode: s(m.periode),
      duree_heures: s(m.duree_heures),
      objectifs: s(m.objectifs),
      hasQuiz: !!m.hasQuiz,
    })),
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function patchM(k: string, fn: (m: Mod) => Mod) {
    setModules((ms) => ms.map((m) => (m._k === k ? fn(m) : m)));
  }
  function move(k: string, dir: -1 | 1) {
    setModules((ms) => {
      const i = ms.findIndex((m) => m._k === k);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= ms.length) return ms;
      const copy = [...ms];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }
  function addModule() {
    setModules((ms) => [
      ...ms,
      {
        _k: uid(),
        code: "",
        titre: "",
        type: "presentiel",
        periode: "",
        duree_heures: "",
        objectifs: "",
        hasQuiz: false,
      },
    ]);
  }

  async function onSave() {
    setSaving(true);
    setMsg(null);
    const meta = {
      code,
      nom: nom.trim(),
      client,
      description,
      format,
      date_debut: dateDebut,
      date_fin: dateFin,
      actif,
    };
    const payload = modules.map((m) => ({
      id: m.id,
      code: m.code,
      titre: m.titre.trim(),
      type: m.type,
      periode: m.periode,
      duree_heures: m.duree_heures,
      objectifs: m.objectifs,
    }));
    const res = await saveParcours(parcours.id, meta, payload);
    setSaving(false);
    setMsg(
      res.ok
        ? { ok: true, text: "Enregistré ✓" }
        : { ok: false, text: "Erreur : " + (res.error ?? "échec") },
    );
  }

  const input =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal";

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/parcours"
          className="text-sm font-semibold text-teal hover:underline"
        >
          ← Tous les parcours
        </Link>
        <Link
          href={`/admin/parcours/${parcours.id}/membres`}
          className="rounded-lg border border-teal px-3 py-1.5 text-xs font-bold text-teal transition hover:bg-teal hover:text-white"
        >
          Participants →
        </Link>
      </div>

      {/* Métadonnées */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom du parcours"
          className="font-display block w-full border-0 border-b border-transparent px-0 text-2xl font-bold text-ink outline-none focus:border-teal"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-500">
            Client
            <input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className={`mt-1 ${input}`}
            />
          </label>
          <label className="text-xs font-semibold text-slate-500">
            Code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`mt-1 ${input}`}
            />
          </label>
          <label className="text-xs font-semibold text-slate-500">
            Début
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className={`mt-1 ${input}`}
            />
          </label>
          <label className="text-xs font-semibold text-slate-500">
            Fin
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className={`mt-1 ${input}`}
            />
          </label>
          <label className="text-xs font-semibold text-slate-500 sm:col-span-2">
            Format
            <input
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              placeholder="Ex. Présentiel + distanciel, 8 mois…"
              className={`mt-1 ${input}`}
            />
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
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={actif}
            onChange={(e) => setActif(e.target.checked)}
          />
          Parcours actif
        </label>
      </div>

      {/* Modules */}
      <h2 className="font-display mt-6 text-lg font-bold text-ink">
        Modules ({modules.length})
      </h2>
      <div className="mt-3 space-y-3">
        {modules.map((m, i) => (
          <div
            key={m._k}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-teal/10 text-xs font-bold text-teal-dark">
                {i + 1}
              </span>
              <input
                value={m.code}
                onChange={(e) =>
                  patchM(m._k, (x) => ({ ...x, code: e.target.value }))
                }
                placeholder="Code"
                className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600 outline-none focus:border-teal"
              />
              <select
                value={m.type}
                onChange={(e) =>
                  patchM(m._k, (x) => ({ ...x, type: e.target.value }))
                }
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-600 outline-none focus:border-teal"
              >
                {MODULE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {m.hasQuiz && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                  Quiz
                </span>
              )}
              <div className="ml-auto flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => move(m._k, -1)}
                  className="rounded px-1.5 py-0.5 hover:bg-slate-100"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(m._k, 1)}
                  className="rounded px-1.5 py-0.5 hover:bg-slate-100"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setModules((ms) => ms.filter((x) => x._k !== m._k))
                  }
                  className="rounded px-1.5 py-0.5 text-rose hover:bg-rose/10"
                  title="Supprimer le module"
                >
                  ✕
                </button>
              </div>
            </div>
            <input
              value={m.titre}
              onChange={(e) =>
                patchM(m._k, (x) => ({ ...x, titre: e.target.value }))
              }
              placeholder="Titre du module"
              className="mt-2.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-teal"
            />
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input
                value={m.periode}
                onChange={(e) =>
                  patchM(m._k, (x) => ({ ...x, periode: e.target.value }))
                }
                placeholder="Période (ex. Sept. 2026)"
                className={input}
              />
              <input
                value={m.duree_heures}
                onChange={(e) =>
                  patchM(m._k, (x) => ({ ...x, duree_heures: e.target.value }))
                }
                placeholder="Durée (heures)"
                inputMode="decimal"
                className={input}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addModule}
        className="mt-3 w-full rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-500 transition hover:border-teal hover:text-teal"
      >
        + Ajouter un module
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
