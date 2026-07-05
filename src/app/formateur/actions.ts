"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function replyToLearner(
  inscriptionId: string,
  contenu: string,
): Promise<{ ok?: boolean; error?: string }> {
  const trimmed = contenu.trim();
  if (!trimmed) return { error: "Message vide" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const { error } = await supabase.from("messages").insert({
    inscription_id: inscriptionId,
    canal: "formateur",
    expediteur: "formateur",
    formateur_id: user.id,
    contenu: trimmed,
  });
  if (error) return { error: "Échec de l'envoi" };

  revalidatePath("/formateur/messages");
  return { ok: true };
}
