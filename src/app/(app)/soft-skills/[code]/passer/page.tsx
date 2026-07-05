import { notFound } from "next/navigation";
import { getQuestionnaireForPlay } from "@/lib/questionnaire";
import QuestionnairePlayer from "@/components/questionnaire-player";

export default async function PasserQuestionnairePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const questionnaire = await getQuestionnaireForPlay(code);
  if (!questionnaire) notFound();

  return <QuestionnairePlayer questionnaire={questionnaire} />;
}
