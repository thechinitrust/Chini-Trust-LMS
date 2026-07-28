"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { Award, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/context/auth-context";
import { useLocalProgress } from "@/hooks/use-local-progress";
import { notify } from "@/lib/toast";
import { getQuizById, getQuestionsForQuiz, getCourseById } from "@/lib/mock-data";
import type { QuizAttempt } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuizCard } from "@/components/shared/quiz-card";
import { Reveal } from "@/components/motion/reveal";

export default function QuizPage() {
  const params = useParams<{ quizId: string }>();
  const quiz = getQuizById(params.quizId);
  const { user } = useAuth();
  const progress = useLocalProgress(user?.id ?? "anonymous");

  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [reviewMode, setReviewMode] = React.useState(false);

  if (!quiz) notFound();
  const course = getCourseById(quiz.courseId);
  const questions = getQuestionsForQuiz(quiz.id);

  const allAnswered = questions.every((q) => answers[q.id]);

  const score = React.useMemo(() => {
    if (questions.length === 0) return 0;
    const correct = questions.filter((q) => {
      const selected = answers[q.id];
      const correctOption = q.options.find((o) => o.isCorrect);
      return selected && correctOption && selected === correctOption.id;
    }).length;
    return Math.round((correct / questions.length) * 100);
  }, [answers, questions]);

  const passed = score >= quiz.passThreshold;

  const handleSubmit = () => {
    setSubmitted(true);
    if (user) {
      const attempt: QuizAttempt = {
        id: `attempt-${Date.now()}`,
        userId: user.id,
        quizId: quiz.id,
        score,
        passed,
        answers: Object.fromEntries(Object.entries(answers).map(([qId, optId]) => [qId, [optId]])),
        attemptedAt: new Date().toISOString(),
      };
      progress.recordQuizAttempt(attempt);
    }
    notify[passed ? "success" : "info"](
      passed ? "Quiz passed" : "Quiz not passed",
      `You scored ${score}%. ${passed ? "" : `You need ${quiz.passThreshold}% to pass.`}`
    );
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmitted(false);
    setReviewMode(false);
  };

  return (
    <div className="container-page max-w-3xl px-6 py-16 lg:px-12">
      <Reveal>
        <nav className="text-sm text-muted-foreground">
          {course && (
            <Link href={`/courses/${course.id}`} className="hover:text-primary-text">
              {course.title}
            </Link>
          )}
        </nav>
        <h1 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">{quiz.title}</h1>
        <p className="mt-3 text-muted-foreground">{quiz.description}</p>
      </Reveal>

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="mt-7">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-7">
                <div className="flex items-center gap-4">
                  <span
                    className={`flex size-12 items-center justify-center rounded-full ${
                      passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {passed ? (
                      <CheckCircle2 className="size-6" strokeWidth={1.5} aria-hidden="true" />
                    ) : (
                      <XCircle className="size-6" strokeWidth={1.5} aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <p className="font-serif text-2xl text-foreground">{score}%</p>
                    <p className="text-sm text-muted-foreground">
                      {passed ? "You passed this quiz." : `You need ${quiz.passThreshold}% to pass.`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setReviewMode((r) => !r)}>
                    {reviewMode ? "Hide review" : "Review answers"}
                  </Button>
                  <Button variant="outline" onClick={handleRetake}>
                    <RotateCcw className="size-4" strokeWidth={1.5} aria-hidden="true" />
                    Retake
                  </Button>
                  {passed && course?.requiresCertificate && (
                    <Button asChild>
                      <Link href="/dashboard">
                        <Award className="size-4" strokeWidth={1.5} aria-hidden="true" />
                        View dashboard
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-7 space-y-5">
        {questions.map((question, idx) => (
          <QuizCard
            key={question.id}
            question={question}
            index={idx}
            total={questions.length}
            selectedOptionId={answers[question.id]}
            onSelect={(optionId) => !submitted && setAnswers((prev) => ({ ...prev, [question.id]: optionId }))}
            reviewMode={submitted && reviewMode}
          />
        ))}
      </div>

      {!submitted && (
        <Button className="mt-7 w-full sm:w-auto" size="lg" disabled={!allAnswered} onClick={handleSubmit}>
          Submit quiz
        </Button>
      )}
    </div>
  );
}
