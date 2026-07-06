"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuiz } from "@/app/admin/actions";

export default function NewQuizButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    const titre = window.prompt("Titre du nouveau quiz (bibliothèque) :", "Nouveau quiz");
    if (titre === null) return;
    setBusy(true);
    const res = await createQuiz(titre);
    setBusy(false);
    if (res.ok && res.id) {
      router.push(`/admin/quiz/${res.id}`);
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
      {busy ? "Création…" : "+ Nouveau quiz"}
    </button>
  );
}
