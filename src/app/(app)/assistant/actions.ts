"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendFormateurMessage(
  contenu: string,
): Promise<{ ok?: boolean; error?: string }> {
  const trimmed = contenu.trim();
  if (!trimmed) return { error: "Message vide" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const { data: insc } = await supabase
    .from("inscriptions")
    .select("id")
    .eq("profil_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!insc) return { error: "Aucun parcours associé" };

  const { error } = await supabase.from("messages").insert({
    inscription_id: insc.id,
    canal: "formateur",
    expediteur: "apprenant",
    contenu: trimmed,
  });
  if (error) return { error: "Échec de l'envoi" };
  return { ok: true };
}
