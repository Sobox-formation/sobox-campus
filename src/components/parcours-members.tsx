"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  enroll,
  unenroll,
  assignFormateur,
  unassignFormateur,
} from "@/app/admin/actions";
import type { Member, AdminUser } from "@/lib/admin";

const name = (m: { prenom: string | null; nom: string | null; email: string | null }) =>
  `${m.prenom ?? ""} ${m.nom ?? ""}`.trim() || m.email || "—";

export default function ParcoursMembers({
  parcoursId,
  apprenants,
  formateurs,
  candidateApprenants,
  candidateFormateurs,
}: {
  parcoursId: string;
  apprenants: Member[];
  formateurs: Member[];
  candidateApprenants: AdminUser[];
  candidateFormateurs: AdminUser[];
}) {
  const router = useRouter();
  const [pickA, setPickA] = useState("");
  const [pickF, setPickF] = useState("");

  async function addApprenant() {
    if (!pickA) return;
    await enroll(pickA, parcoursId);
    setPickA("");
    router.refresh();
  }
  async function addFormateur() {
    if (!pickF) return;
    await assignFormateur(pickF, parcoursId, "");
    setPickF("");
    router.refresh();
  }

  const selectCls =
    "flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal";
  const addBtn =
    "rounded-lg bg-teal px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-dark disabled:opacity-50";

  const Row = ({
    m,
    onRemove,
    right,
  }: {
    m: Member;
    onRemove: () => void;
    right?: string;
  }) => (
    <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-2.5 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{name(m)}</p>
        <p className="truncate text-xs text-slate-400">{m.email}</p>
      </div>
      {right && <span className="text-xs font-bold text-slate-500">{right}</span>}
      <button
        type="button"
        onClick={onRemove}
        className="rounded px-2 py-1 text-xs font-semibold text-rose hover:bg-rose/10"
      >
        Retirer
      </button>
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Apprenants */}
      <section>
        <h2 className="font-display text-lg font-bold text-ink">
          Apprenants ({apprenants.length})
        </h2>
        <div className="mt-3 flex gap-2">
          <select
            value={pickA}
            onChange={(e) => setPickA(e.target.value)}
            className={selectCls}
          >
            <option value="">Ajouter un apprenant…</option>
            {candidateApprenants.map((u) => (
              <option key={u.id} value={u.id}>
                {u.prenom} {u.nom} — {u.email}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addApprenant}
            disabled={!pickA}
            className={addBtn}
          >
            + Inscrire
          </button>
        </div>
        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {apprenants.length ? (
            apprenants.map((m) => (
              <Row
                key={m.id}
                m={m}
                right={`${Math.round(m.progression ?? 0)}%`}
                onRemove={async () => {
                  await unenroll(m.id, parcoursId);
                  router.refresh();
                }}
              />
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-slate-400">Aucun apprenant inscrit.</p>
          )}
        </div>
      </section>

      {/* Formateurs */}
      <section>
        <h2 className="font-display text-lg font-bold text-ink">
          Formateurs ({formateurs.length})
        </h2>
        <div className="mt-3 flex gap-2">
          <select
            value={pickF}
            onChange={(e) => setPickF(e.target.value)}
            className={selectCls}
          >
            <option value="">Affecter un formateur…</option>
            {candidateFormateurs.map((u) => (
              <option key={u.id} value={u.id}>
                {u.prenom} {u.nom} — {u.email}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addFormateur}
            disabled={!pickF}
            className={addBtn}
          >
            + Affecter
          </button>
        </div>
        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {formateurs.length ? (
            formateurs.map((m) => (
              <Row
                key={m.id}
                m={m}
                onRemove={async () => {
                  await unassignFormateur(m.id, parcoursId);
                  router.refresh();
                }}
              />
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-slate-400">Aucun formateur affecté.</p>
          )}
        </div>
      </section>
    </div>
  );
}
