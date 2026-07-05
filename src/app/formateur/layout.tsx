import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FormateurSidebar from "@/components/formateur-sidebar";

export default async function FormateurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom, prenom, role")
    .eq("id", user.id)
    .maybeSingle();

  // Réservé aux formateurs et admins
  if (profile?.role !== "formateur" && profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: pf } = await supabase
    .from("parcours_formateurs")
    .select("parcours:parcours_id (nom)")
    .eq("formateur_id", user.id)
    .limit(1);
  const parc = pf?.[0]?.parcours as { nom: string } | { nom: string }[] | undefined;
  const parcoursNom = Array.isArray(parc) ? parc[0]?.nom : parc?.nom;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <FormateurSidebar
        prenom={profile?.prenom ?? ""}
        nom={profile?.nom ?? ""}
        parcoursNom={parcoursNom ?? "Ma promo"}
      />
      <main className="min-w-0">
        <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
      </main>
    </div>
  );
}
