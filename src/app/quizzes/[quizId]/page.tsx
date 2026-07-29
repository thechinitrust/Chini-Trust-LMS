import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCourseById } from "@/lib/data/courses";
import { getLatestPassingAttempt, getQuizById, getQuizQuestionsForLearner } from "@/lib/data/quizzes";
import { Reveal } from "@/components/motion/reveal";
import { QuizTaker } from "./quiz-taker";

export default async function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const supabase = await createClient();

  const quiz = await getQuizById(supabase, quizId);
  if (!quiz) notFound();

  const [course, questions, { data: { user } }] = await Promise.all([
    getCourseById(supabase, quiz.courseId),
    getQuizQuestionsForLearner(supabase, quiz.id),
    supabase.auth.getUser(),
  ]);
  const alreadyPassedAttempt = user ? await getLatestPassingAttempt(supabase, user.id, quiz.id) : undefined;

  return (
    <div className="container-page max-w-3xl px-6 py-16 lg:px-12">
      <Reveal>
        <nav className="text-sm text-muted-foreground">
          {course && (
            <Link href={`/courses/${course.slug}`} className="hover:text-primary-text">
              {course.title}
            </Link>
          )}
        </nav>
        <h1 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">{quiz.title}</h1>
        <p className="mt-3 text-muted-foreground">{quiz.description}</p>
      </Reveal>

      <QuizTaker
        quizId={quiz.id}
        passThreshold={quiz.passThreshold}
        isLoggedIn={Boolean(user)}
        requiresCertificate={course?.requiresCertificate ?? false}
        questions={questions}
        alreadyPassed={
          alreadyPassedAttempt ? { score: alreadyPassedAttempt.score, attemptedAt: alreadyPassedAttempt.attemptedAt } : undefined
        }
      />
    </div>
  );
}
