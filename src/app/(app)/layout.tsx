import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/sidebar";

export default async function AppLayout({
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
    .select("nom, prenom, email")
    .eq("id", user.id)
    .single();

  const { data: inscriptions } = await supabase
    .from("inscriptions")
    .select("parcours:parcours_id (nom)")
    .eq("profil_id", user.id)
    .limit(1);

  const insc = inscriptions?.[0];
  const parc = (
    Array.isArray(insc?.parcours) ? insc?.parcours[0] : insc?.parcours
  ) as { nom: string } | undefined;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <Sidebar
        prenom={profile?.prenom ?? ""}
        nom={profile?.nom ?? ""}
        email={profile?.email ?? user.email ?? ""}
        parcoursNom={parc?.nom ?? "Aucun parcours"}
      />
      <main className="min-w-0">
        <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
      </main>
    </div>
  );
}
