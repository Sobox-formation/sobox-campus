import { notFound } from "next/navigation";
import { getQuizForEdit } from "@/lib/admin";
import QuizEditor from "@/components/quiz-editor";

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quiz = await getQuizForEdit(id);
  if (!quiz) notFound();
  return <QuizEditor quiz={quiz} />;
}
