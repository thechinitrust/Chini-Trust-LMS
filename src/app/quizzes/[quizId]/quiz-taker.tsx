"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { createClient } from "@/lib/supabase/client";
import { getQuizReview, submitQuizAttempt, type PublicQuizQuestion, type QuizReviewRow } from "@/lib/data/quizzes";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuizCard } from "@/components/shared/quiz-card";

interface QuizTakerProps {
  quizId: string;
  passThreshold: number;
  isLoggedIn: boolean;
  requiresCertificate: boolean;
  questions: PublicQuizQuestion[];
  alreadyPassed?: { score: number; attemptedAt: string };
}

export function QuizTaker({ quizId, passThreshold, isLoggedIn, requiresCertificate, questions, alreadyPassed }: QuizTakerProps) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [answers, setAnswers] = React.useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ score: number; passed: boolean; attemptId: string } | null>(null);
  const [reviewMode, setReviewMode] = React.useState(false);
  const [review, setReview] = React.useState<QuizReviewRow[] | null>(null);
  const [dismissedBanner, setDismissedBanner] = React.useState(false);

  const allAnswered = questions.every((q) => (answers[q.id]?.length ?? 0) > 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const attempt = await submitQuizAttempt(supabase, quizId, answers);
      setResult({ score: attempt.score, passed: attempt.passed, attemptId: attempt.id });
      notify[attempt.passed ? "success" : "info"](
        attempt.passed ? "Quiz passed" : "Quiz not passed",
        `You scored ${attempt.score}%. ${attempt.passed ? "" : `You need ${passThreshold}% to pass.`}`
      );
      router.refresh();
    } catch (error) {
      notify.error("Couldn't submit quiz", error instanceof Error ? error.message : undefined);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReview = async () => {
    if (!result) return;
    if (!review) {
      try {
        const rows = await getQuizReview(supabase, result.attemptId);
        setReview(rows);
      } catch (error) {
        notify.error("Couldn't load review", error instanceof Error ? error.message : undefined);
        return;
      }
    }
    setReviewMode((r) => !r);
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setReview(null);
    setReviewMode(false);
  };

  const reviewByQuestion = React.useMemo(() => {
    const map = new Map<string, QuizReviewRow[]>();
    for (const row of review ?? []) {
      const list = map.get(row.questionId) ?? [];
      list.push(row);
      map.set(row.questionId, list);
    }
    return map;
  }, [review]);

  return (
    <>
      {alreadyPassed && !dismissedBanner && !result && (
        <Card tone="brand" className="mt-5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="text-sm text-foreground">
              You already passed this quiz with a score of <strong>{alreadyPassed.score}%</strong>.
            </p>
            <Button size="sm" variant="outline" onClick={() => setDismissedBanner(true)}>
              Retake anyway
            </Button>
          </CardContent>
        </Card>
      )}

      <AnimatePresence>
        {result && (
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
                      result.passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {result.passed ? (
                      <CheckCircle2 className="size-6" strokeWidth={1.5} aria-hidden="true" />
                    ) : (
                      <XCircle className="size-6" strokeWidth={1.5} aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <p className="font-serif text-2xl text-foreground">{result.score}%</p>
                    <p className="text-sm text-muted-foreground">
                      {result.passed ? "You passed this quiz." : `You need ${passThreshold}% to pass.`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={toggleReview}>
                    {reviewMode ? "Hide review" : "Review answers"}
                  </Button>
                  <Button variant="outline" onClick={handleRetake}>
                    <RotateCcw className="size-4" strokeWidth={1.5} aria-hidden="true" />
                    Retake
                  </Button>
                  {result.passed && requiresCertificate && (
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
        {questions.map((question, idx) => {
          const reviewOptions = reviewByQuestion.get(question.id);
          return (
            <QuizCard
              key={question.id}
              question={{
                id: question.id,
                quizId: question.quizId,
                question: question.question,
                type: question.type,
                order: question.order,
                options: question.options.map((o) => {
                  const reviewRow = reviewOptions?.find((r) => r.optionId === o.id);
                  return { id: o.id, text: o.text, isCorrect: reviewRow?.isCorrect ?? false };
                }),
              }}
              index={idx}
              total={questions.length}
              selectedOptionIds={
                reviewMode
                  ? question.options.filter((o) => reviewOptions?.find((r) => r.optionId === o.id)?.selected).map((o) => o.id)
                  : answers[question.id]
              }
              onSelect={(optionId) =>
                !result &&
                setAnswers((prev) => {
                  if (question.type === "multiple-choice") {
                    const current = prev[question.id] ?? [];
                    const next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
                    return { ...prev, [question.id]: next };
                  }
                  return { ...prev, [question.id]: [optionId] };
                })
              }
              reviewMode={reviewMode}
            />
          );
        })}
      </div>

      {!result &&
        (isLoggedIn ? (
          <Button className="mt-7 w-full sm:w-auto" size="lg" disabled={!allAnswered || submitting} onClick={handleSubmit}>
            {submitting ? "Submitting…" : "Submit quiz"}
          </Button>
        ) : (
          <Button className="mt-7 w-full sm:w-auto" size="lg" asChild>
            <Link href="/login">Log in to submit</Link>
          </Button>
        ))}
    </>
  );
}
