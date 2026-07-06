"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EditQuestion } from "@/lib/admin";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("forbidden");
  return supabase;
}

export async function saveQuiz(
  id: string,
  titre: string,
  description: string,
  seuil: number,
  questions: EditQuestion[],
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await assertAdmin();
  const { error } = await supabase.rpc("admin_save_quiz", {
    p_quiz_id: id,
    p_titre: titre,
    p_description: description,
    p_seuil: seuil,
    p_questions: questions,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/quiz/${id}`);
  revalidatePath("/admin/quiz");
  revalidatePath("/evaluations");
  return { ok: true };
}

export async function createQuiz(
  titre: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = await assertAdmin();
  const { data, error } = await supabase
    .from("quiz")
    .insert({ titre: titre.trim() || "Nouveau quiz", source: "natif" })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/quiz");
  return { ok: true, id: data.id };
}

export async function deleteQuiz(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("quiz").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/quiz");
  return { ok: true };
}

/* ---------- Constructeur de parcours ---------- */

export async function createParcours(
  nom: string,
  client: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = await assertAdmin();
  const { data, error } = await supabase.rpc("admin_create_parcours", {
    p_nom: nom,
    p_client: client,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/parcours");
  return { ok: true, id: data as string };
}

export async function saveParcours(
  id: string,
  meta: Record<string, unknown>,
  modules: Record<string, unknown>[],
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await assertAdmin();
  const { error } = await supabase.rpc("admin_save_parcours", {
    p_id: id,
    p_meta: meta,
    p_modules: modules,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/parcours/${id}`);
  revalidatePath("/admin/parcours");
  revalidatePath("/parcours");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteParcours(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await assertAdmin();
  const { error } = await supabase.rpc("admin_delete_parcours", { p_id: id });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/parcours");
  return { ok: true };
}
