"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser, setUserRole } from "@/app/admin/actions";
import type { AdminUser } from "@/lib/admin";

const ROLES = [
  { v: "apprenant", l: "Apprenant" },
  { v: "formateur", l: "Formateur" },
  { v: "admin", l: "Admin" },
];

const ROLE_STYLE: Record<string, string> = {
  apprenant: "bg-slate-100 text-slate-500",
  formateur: "bg-teal/10 text-teal-dark",
  admin: "bg-rose/10 text-rose",
};

export default function UsersAdmin({ users }: { users: AdminUser[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    prenom: "",
    nom: "",
    role: "apprenant",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const input =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal";

  async function create() {
    if (!form.email.trim() || !form.password.trim()) {
      setMsg({ ok: false, text: "E-mail et mot de passe requis." });
      return;
    }
    setBusy(true);
    setMsg(null);
    const res = await createUser(
      form.email,
      form.password,
      form.prenom,
      form.nom,
      form.role,
    );
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Utilisateur créé ✓" });
      setForm({ email: "", password: "", prenom: "", nom: "", role: "apprenant" });
      router.refresh();
    } else {
      setMsg({ ok: false, text: "Erreur : " + (res.error ?? "échec") });
    }
  }

  async function changeRole(id: string, role: string) {
    await setUserRole(id, role);
    router.refresh();
  }

  return (
    <div>
      {/* Création */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-display text-lg font-bold text-ink">
          Créer un utilisateur
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            value={form.prenom}
            onChange={(e) => setForm({ ...form, prenom: e.target.value })}
            placeholder="Prénom"
            className={input}
          />
          <input
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            placeholder="Nom"
            className={input}
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="E-mail"
            type="email"
            className={input}
          />
          <input
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Mot de passe initial"
            className={input}
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className={input}
          >
            {ROLES.map((r) => (
              <option key={r.v} value={r.v}>
                {r.l}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={create}
            disabled={busy}
            className="rounded-lg bg-teal px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-dark disabled:opacity-60"
          >
            {busy ? "Création…" : "Créer l’utilisateur"}
          </button>
        </div>
        {msg && (
          <p
            className={[
              "mt-3 text-sm font-semibold",
              msg.ok ? "text-emerald-600" : "text-rose",
            ].join(" ")}
          >
            {msg.text}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-400">
          Le compte est actif immédiatement. Communique le mot de passe initial à
          l’utilisateur (il pourra le changer plus tard).
        </p>
      </div>

      {/* Liste */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {users.map((u, i) => (
          <div
            key={u.id}
            className={[
              "flex items-center gap-3 px-5 py-3",
              i < users.length - 1 ? "border-b border-slate-100" : "",
            ].join(" ")}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                {u.prenom} {u.nom}
              </p>
              <p className="truncate text-xs text-slate-400">{u.email}</p>
            </div>
            {u.nbInscriptions > 0 && (
              <span className="text-xs text-slate-400">
                {u.nbInscriptions} parcours
              </span>
            )}
            <span
              className={[
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                ROLE_STYLE[u.role] ?? "bg-slate-100 text-slate-500",
              ].join(" ")}
            >
              {u.role}
            </span>
            <select
              value={u.role}
              onChange={(e) => changeRole(u.id, e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 outline-none focus:border-teal"
            >
              {ROLES.map((r) => (
                <option key={r.v} value={r.v}>
                  {r.l}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
