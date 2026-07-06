"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createParcours } from "@/app/admin/actions";

export default function NewParcoursButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    const nom = window.prompt("Nom du parcours :", "Nouveau parcours");
    if (nom === null) return;
    const client = window.prompt("Client (facultatif) :", "") ?? "";
    setBusy(true);
    const res = await createParcours(nom, client);
    setBusy(false);
    if (res.ok && res.id) {
      router.push(`/admin/parcours/${res.id}`);
    } else {
      window.alert("Erreur : " + (res.error ?? "création impossible"));
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="rounded-xl bg-teal px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-dark disabled:opacity-60"
    >
      {busy ? "Création…" : "+ Nouveau parcours"}
    </button>
  );
}
