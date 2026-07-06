import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getParcoursMembers,
  getAdminUsers,
  getParcoursForEdit,
} from "@/lib/admin";
import ParcoursMembers from "@/components/parcours-members";

export default async function ParcoursMembresPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [parcours, members, users] = await Promise.all([
    getParcoursForEdit(id),
    getParcoursMembers(id),
    getAdminUsers(),
  ]);
  if (!parcours) notFound();

  const enrolledIds = new Set(members.apprenants.map((a) => a.id));
  const assignedIds = new Set(members.formateurs.map((f) => f.id));
  const candidateApprenants = users.filter(
    (u) => u.role === "apprenant" && !enrolledIds.has(u.id),
  );
  const candidateFormateurs = users.filter(
    (u) => u.role === "formateur" && !assignedIds.has(u.id),
  );

  return (
    <div>
      <Link
        href={`/admin/parcours/${id}`}
        className="text-sm font-semibold text-teal hover:underline"
      >
        ← {parcours.nom}
      </Link>
      <h1 className="font-display mt-3 text-3xl font-bold text-ink">
        Participants
      </h1>
      <p className="mt-2 text-slate-500">
        Inscris des apprenants et affecte les formateurs de ce parcours.
      </p>

      <div className="mt-8">
        <ParcoursMembers
          parcoursId={id}
          apprenants={members.apprenants}
          formateurs={members.formateurs}
          candidateApprenants={candidateApprenants}
          candidateFormateurs={candidateFormateurs}
        />
      </div>
    </div>
  );
}
