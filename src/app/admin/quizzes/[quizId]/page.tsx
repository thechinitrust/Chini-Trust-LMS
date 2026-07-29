import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getQuestionsForQuiz, getQuizById } from "@/lib/data/quizzes";
import { QuestionEditor } from "./question-editor";

export default async function QuizQuestionsPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const supabase = await createClient();

  const quiz = await getQuizById(supabase, quizId);
  if (!quiz) notFound();

  const questions = await getQuestionsForQuiz(supabase, quizId);

  return (
    <div>
      <Link
        href="/admin/quizzes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to quizzes
      </Link>
      <div className="mt-3">
        <h1 className="font-serif text-3xl tracking-tight text-foreground">{quiz.title}</h1>
        <p className="mt-2 text-muted-foreground">
          Add questions and answer options. Mark exactly one option correct for single-choice/true-false
          questions, or more than one for multiple-choice.
        </p>
      </div>

      <div className="mt-8">
        <QuestionEditor quizId={quiz.id} initialQuestions={questions} />
      </div>
    </div>
  );
}
