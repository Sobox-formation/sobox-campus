import { createClient } from "@/lib/supabase/server";
import type { TimelineStep } from "@/components/parcours-timeline";

export type ParcoursModule = {
  id: string;
  ordre: number;
  code: string | null;
  titre: string;
  type: string | null;
  lieu: string | null;
  periode: string | null;
  statut: TimelineStep["statut"];
};

export type ParcoursData = {
  profile: { nom: string | null; prenom: string | null; email: string | null } | null;
  parcours: {
    id: string;
    nom: string;
    client: string | null;
    date_debut: string | null;
    date_fin: string | null;
  } | null;
  progression: number;
  modules: ParcoursModule[];
  steps: TimelineStep[];
};

// Récupère le parcours actif de l'apprenant connecté, ses modules et leur statut.
export async function getParcoursData(): Promise<ParcoursData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom, prenom, email")
    .eq("id", user.id)
    .single();

  const { data: inscriptions } = await supabase
    .from("inscriptions")
    .select(
      "id, progression, parcours:parcours_id (id, nom, client, date_debut, date_fin)",
    )
    .eq("profil_id", user.id)
    .limit(1);

  const insc = inscriptions?.[0];
  const parcours = (
    Array.isArray(insc?.parcours) ? insc?.parcours[0] : insc?.parcours
  ) as ParcoursData["parcours"];

  let modules: ParcoursModule[] = [];
  if (parcours?.id && insc?.id) {
    const { data: mods } = await supabase
      .from("modules")
      .select("id, ordre, code, titre, type, lieu, periode")
      .eq("parcours_id", parcours.id)
      .order("ordre");

    const { data: prog } = await supabase
      .from("module_progression")
      .select("module_id, statut")
      .eq("inscription_id", insc.id);

    const statutMap = new Map<string, string>();
    prog?.forEach((p) => statutMap.set(p.module_id, p.statut));

    modules = (mods ?? []).map((m) => ({
      id: m.id,
      ordre: m.ordre,
      code: m.code,
      titre: m.titre,
      type: m.type,
      lieu: m.lieu,
      periode: m.periode,
      statut: (statutMap.get(m.id) ?? "verrouille") as TimelineStep["statut"],
    }));
  }

  const steps: TimelineStep[] = modules.map((m) => ({
    id: m.id,
    code: m.code ?? String(m.ordre),
    titre: m.titre,
    periode: m.periode,
    lieu: m.lieu,
    statut: m.statut,
  }));

  return {
    profile: profile ?? null,
    parcours: parcours ?? null,
    progression: insc?.progression ?? 0,
    modules,
    steps,
  };
}

export type BiblioResource = {
  id: string;
  type: string;
  titre: string;
  description: string | null;
  url: string | null;
};

export type BiblioGroup = {
  moduleId: string | null;
  code: string;
  titre: string;
  ordre: number;
  statut: TimelineStep["statut"] | "parcours";
  locked: boolean;
  resources: BiblioResource[];
};

// Regroupe les ressources par module, en indiquant lesquelles sont verrouillées
// (module au statut "verrouille"). Les URL des ressources verrouillées ne sont
// jamais envoyées au client (rendu côté serveur).
export async function getBibliotheque(): Promise<{
  parcours: ParcoursData["parcours"];
  groups: BiblioGroup[];
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const data = await getParcoursData();
  if (!data?.parcours) return { parcours: null, groups: [] };

  const { data: res } = await supabase
    .from("ressources")
    .select("id, type, titre, description, url, ordre, module_id")
    .eq("parcours_id", data.parcours.id)
    .order("ordre");

  const byModule = new Map<string, BiblioResource[]>();
  const parcoursLevel: BiblioResource[] = [];

  (res ?? []).forEach((r) => {
    const item: BiblioResource = {
      id: r.id,
      type: r.type,
      titre: r.titre,
      description: r.description,
      url: r.url,
    };
    if (r.module_id) {
      const arr = byModule.get(r.module_id) ?? [];
      arr.push(item);
      byModule.set(r.module_id, arr);
    } else {
      parcoursLevel.push(item);
    }
  });

  const groups: BiblioGroup[] = [];
  if (parcoursLevel.length) {
    groups.push({
      moduleId: null,
      code: "",
      titre: "Ressources du parcours",
      ordre: -1,
      statut: "parcours",
      locked: false,
      resources: parcoursLevel,
    });
  }
  data.modules.forEach((m) => {
    const rs = byModule.get(m.id);
    if (!rs || rs.length === 0) return;
    const locked = m.statut === "verrouille";
    groups.push({
      moduleId: m.id,
      code: m.code ?? String(m.ordre),
      titre: m.titre,
      ordre: m.ordre,
      statut: m.statut,
      // On masque les URL des ressources verrouillées
      resources: locked ? rs.map((r) => ({ ...r, url: null })) : rs,
      locked,
    });
  });

  return { parcours: data.parcours, groups };
}
