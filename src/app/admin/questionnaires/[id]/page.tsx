import { notFound } from "next/navigation";
import { getQuestionnaireForEdit } from "@/lib/admin";
import QuestionnaireEditor from "@/components/questionnaire-editor";

export default async function EditQuestionnairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const questionnaire = await getQuestionnaireForEdit(id);
  if (!questionnaire) notFound();
  return <QuestionnaireEditor questionnaire={questionnaire} />;
}
