import { createClient } from "@/lib/supabase/server";

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type FormateurMessage = {
  expediteur: string;
  contenu: string;
  creeLe: string;
};

export async function getAssistantData(): Promise<{
  inscriptionId: string | null;
  willy: ChatMessage[];
  formateur: FormateurMessage[];
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: insc } = await supabase
    .from("inscriptions")
    .select("id")
    .eq("profil_id", user.id)
    .limit(1)
    .maybeSingle();

  const inscriptionId = insc?.id ?? null;
  const willy: ChatMessage[] = [];
  const formateur: FormateurMessage[] = [];

  if (inscriptionId) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("canal, expediteur, contenu, cree_le")
      .eq("inscription_id", inscriptionId)
      .order("cree_le", { ascending: true });

    (msgs ?? []).forEach((m) => {
      if (m.canal === "willy") {
        willy.push({
          role: m.expediteur === "apprenant" ? "user" : "assistant",
          content: m.contenu,
        });
      } else if (m.canal === "formateur") {
        formateur.push({
          expediteur: m.expediteur,
          contenu: m.contenu,
          creeLe: m.cree_le,
        });
      }
    });
  }

  return { inscriptionId, willy, formateur };
}
