import { notFound } from "next/navigation";
import { getParcoursForEdit } from "@/lib/admin";
import ParcoursEditor from "@/components/parcours-editor";

export default async function EditParcoursPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const parcours = await getParcoursForEdit(id);
  if (!parcours) notFound();
  return <ParcoursEditor parcours={parcours} />;
}
