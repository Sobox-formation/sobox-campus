import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
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
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
          <Link href="/admin/quiz" className="font-display font-bold text-ink">
            SOBOX <span className="text-teal">· Admin</span>
          </Link>
          <nav className="flex gap-4 text-sm font-semibold text-slate-500">
            <Link href="/admin/parcours" className="transition hover:text-teal">
              Parcours
            </Link>
            <Link href="/admin/quiz" className="transition hover:text-teal">
              Quiz
            </Link>
          </nav>
          <Link
            href="/formateur"
            className="ml-auto text-sm font-semibold text-teal hover:underline"
          >
            Espace formateur →
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
