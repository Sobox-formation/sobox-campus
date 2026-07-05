import { createClient } from "@/lib/supabase/server";

function one<T>(v: T | T[] | null | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : (v ?? undefined);
}

export type PromoLearner = {
  profilId: string;
  nom: string;
  prenom: string;
  email: string;
  progression: number;
  done: number;
  total: number;
  currentCode: string | null;
  currentTitre: string | null;
};

export async function getFormateurOverview(): Promise<{
  prenom: string;
  parcoursNom: string;
  client: string | null;
  learners: PromoLearner[];
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("prenom")
    .eq("id", user.id)
    .maybeSingle();

  const { data: pf } = await supabase
    .from("parcours_formateurs")
    .select("parcours:parcours_id (id, nom, client)")
    .eq("formateur_id", user.id);

  const parcs = (pf ?? [])
    .map((x) => one<{ id: string; nom: string; client: string | null }>(x.parcours))
    .filter((p): p is { id: string; nom: string; client: string | null } => !!p);
  const parcoursIds = parcs.map((p) => p.id);

  if (parcoursIds.length === 0) {
    return { prenom: profile?.prenom ?? "", parcoursNom: "—", client: null, learners: [] };
  }

  const { data: inscriptions } = await supabase
    .from("inscriptions")
    .select("id, progression, profil:profil_id (id, nom, prenom, email)")
    .in("parcours_id", parcoursIds);

  const inscIds = (inscriptions ?? []).map((i) => i.id);

  const { data: mp } = inscIds.length
    ? await supabase
        .from("module_progression")
        .select("inscription_id, statut, module:module_id (ordre, code, titre)")
        .in("inscription_id", inscIds)
    : { data: [] as [] };

  const byInsc = new Map<
    string,
    { statut: string; ordre: number; code: string | null; titre: string }[]
  >();
  (mp ?? []).forEach((row) => {
    const m = one<{ ordre: number; code: string | null; titre: string }>(row.module);
    const arr = byInsc.get(row.inscription_id) ?? [];
    arr.push({
      statut: row.statut,
      ordre: m?.ordre ?? 0,
      code: m?.code ?? null,
      titre: m?.titre ?? "",
    });
    byInsc.set(row.inscription_id, arr);
  });

  const learners: PromoLearner[] = (inscriptions ?? [])
    .map((i) => {
      const p = one<{ id: string; nom: string; prenom: string; email: string }>(i.profil);
      const rows = (byInsc.get(i.id) ?? []).sort((a, b) => a.ordre - b.ordre);
      const current =
        rows.find((r) => r.statut === "en_cours") ??
        rows.find((r) => r.statut === "disponible") ??
        null;
      return {
        profilId: p?.id ?? "",
        nom: p?.nom ?? "",
        prenom: p?.prenom ?? "",
        email: p?.email ?? "",
        progression: Number(i.progression),
        done: rows.filter((r) => r.statut === "termine").length,
        total: rows.length,
        currentCode: current?.code ?? null,
        currentTitre: current?.titre ?? null,
      };
    })
    .sort((a, b) => b.progression - a.progression);

  return {
    prenom: profile?.prenom ?? "",
    parcoursNom: parcs[0]?.nom ?? "—",
    client: parcs[0]?.client ?? null,
    learners,
  };
}

export type ApprenantDetail = {
  profil: { nom: string; prenom: string; email: string };
  parcoursNom: string;
  progression: number;
  modules: { code: string; titre: string; periode: string | null; statut: string }[];
  quiz: { titre: string; score: number; reussi: boolean }[];
  soft: { titre: string; profilDominant: string | null }[];
};

export async function getApprenantDetail(
  profilId: string,
): Promise<ApprenantDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom, prenom, email")
    .eq("id", profilId)
    .maybeSingle();
  if (!profile) return null; // hors périmètre du formateur (RLS)

  const { data: insc } = await supabase
    .from("inscriptions")
    .select("id, progression, parcours:parcours_id (id, nom)")
    .eq("profil_id", profilId)
    .limit(1)
    .maybeSingle();
  if (!insc) return null;

  const parcours = one<{ id: string; nom: string }>(insc.parcours);

  const { data: mods } = await supabase
    .from("modules")
    .select("id, ordre, code, titre, periode")
    .eq("parcours_id", parcours?.id ?? "")
    .order("ordre");

  const { data: prog } = await supabase
    .from("module_progression")
    .select("module_id, statut")
    .eq("inscription_id", insc.id);
  const statutMap = new Map<string, string>();
  (prog ?? []).forEach((p) => statutMap.set(p.module_id, p.statut));

  const { data: quiz } = await supabase
    .from("quiz_resultats")
    .select("score, reussi, passe_le, quiz:quiz_id (titre)")
    .eq("profil_id", profilId)
    .order("passe_le", { ascending: false });

  const { data: soft } = await supabase
    .from("questionnaire_resultats")
    .select("profil_dominant, passe_le, questionnaire:questionnaire_id (titre)")
    .eq("profil_id", profilId)
    .order("passe_le", { ascending: false });

  return {
    profil: {
      nom: profile.nom ?? "",
      prenom: profile.prenom ?? "",
      email: profile.email ?? "",
    },
    parcoursNom: parcours?.nom ?? "—",
    progression: Number(insc.progression),
    modules: (mods ?? []).map((m) => ({
      code: m.code ?? String(m.ordre),
      titre: m.titre,
      periode: m.periode,
      statut: statutMap.get(m.id) ?? "verrouille",
    })),
    quiz: (quiz ?? []).map((q) => ({
      titre: one<{ titre: string }>(q.quiz)?.titre ?? "Quiz",
      score: Number(q.score),
      reussi: q.reussi,
    })),
    soft: (soft ?? []).map((s) => ({
      titre: one<{ titre: string }>(s.questionnaire)?.titre ?? "Questionnaire",
      profilDominant: s.profil_dominant,
    })),
  };
}

export type Conversation = {
  inscriptionId: string;
  profilId: string;
  learnerName: string;
  messages: { expediteur: string; contenu: string; creeLe: string }[];
};

export async function getFormateurConversations(): Promise<Conversation[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: msgs } = await supabase
    .from("messages")
    .select(
      "id, inscription_id, expediteur, contenu, cree_le, inscription:inscription_id ( profil:profil_id (id, nom, prenom) )",
    )
    .eq("canal", "formateur")
    .order("cree_le", { ascending: true });

  const byInsc = new Map<string, Conversation>();
  (msgs ?? []).forEach((m) => {
    type ProfilRow = { id: string; nom: string; prenom: string };
    const insc = one<{ profil: ProfilRow | ProfilRow[] }>(m.inscription);
    const profil = one<ProfilRow>(insc?.profil);
    const conv =
      byInsc.get(m.inscription_id) ??
      ({
        inscriptionId: m.inscription_id,
        profilId: profil?.id ?? "",
        learnerName: `${profil?.prenom ?? ""} ${profil?.nom ?? ""}`.trim() || "Apprenant",
        messages: [],
      } as Conversation);
    conv.messages.push({
      expediteur: m.expediteur,
      contenu: m.contenu,
      creeLe: m.cree_le,
    });
    byInsc.set(m.inscription_id, conv);
  });

  return [...byInsc.values()];
}
