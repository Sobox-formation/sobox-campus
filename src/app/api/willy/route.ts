import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getParcoursData } from "@/lib/parcours";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const messages = (body?.messages ?? []) as {
    role: "user" | "assistant";
    content: string;
  }[];
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  // Contexte apprenant pour ancrer les réponses de Willy
  const data = await getParcoursData();
  const prenom = data?.profile?.prenom ?? "";
  const parcours = data?.parcours?.nom ?? "son parcours";
  const current =
    data?.modules.find((m) => m.statut === "en_cours") ??
    data?.modules.find((m) => m.statut === "disponible");
  const done = data?.modules.filter((m) => m.statut === "termine").length ?? 0;
  const total = data?.modules.length ?? 0;

  const system = `Tu es Willy, le copilote IA de SOBOX Campus, la plateforme d'apprentissage de l'organisme de formation SOBOX. Tu accompagnes un apprenant tout au long de son parcours managérial.

Contexte de l'apprenant :
- Prénom : ${prenom || "(inconnu)"}
- Parcours : « ${parcours} »
- Progression : ${done}/${total} étapes terminées
- Étape en cours : ${current?.titre ?? "—"}${current?.periode ? ` (${current.periode})` : ""}

Règles :
- Tutoie l'apprenant, adopte un ton chaleureux, positif et encourageant (tu peux utiliser un emoji avec parcimonie).
- Réponds de façon concise et directe, sans afficher ton raisonnement.
- Aide sur les contenus du parcours, la progression, l'organisation et la méthode.
- Si la demande relève d'un échange humain (situation personnelle, question à un formateur, réclamation), invite l'apprenant à utiliser l'onglet « Formateurs » de cette messagerie.
- N'invente pas d'informations sur des contenus précis que tu ne connais pas ; reste sur ce que tu sais du parcours ou propose de demander à un formateur.`;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      reply:
        "🛠️ Willy est presque prêt ! La clé API n'est pas encore configurée côté serveur. Reviens très vite — en attendant, tu peux joindre tes formateurs via l'onglet « Formateurs ».",
    });
  }

  let reply = "";
  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system,
      messages: messages.slice(-20).map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });
    reply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
  } catch {
    return NextResponse.json(
      { error: "Willy est momentanément indisponible. Réessaie dans un instant." },
      { status: 502 },
    );
  }

  // Persiste le dernier message utilisateur + la réponse de Willy
  const { data: insc } = await supabase
    .from("inscriptions")
    .select("id")
    .eq("profil_id", user.id)
    .limit(1)
    .maybeSingle();

  if (insc) {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const rows: {
      inscription_id: string;
      canal: string;
      expediteur: string;
      contenu: string;
    }[] = [];
    if (lastUser)
      rows.push({
        inscription_id: insc.id,
        canal: "willy",
        expediteur: "apprenant",
        contenu: lastUser.content,
      });
    if (reply)
      rows.push({
        inscription_id: insc.id,
        canal: "willy",
        expediteur: "willy",
        contenu: reply,
      });
    if (rows.length) await supabase.from("messages").insert(rows);
  }

  return NextResponse.json({ reply });
}
