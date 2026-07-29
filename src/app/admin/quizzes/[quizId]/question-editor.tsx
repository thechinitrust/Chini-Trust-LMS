"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import type { QuizQuestion, QuizQuestionType } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import {
  createQuizOption,
  createQuizQuestion,
  deleteQuizOption,
  deleteQuizQuestion,
  updateQuizOption,
  updateQuizQuestion,
} from "@/lib/data/quizzes";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

const TYPE_LABEL: Record<QuizQuestionType, string> = {
  "single-choice": "Single choice",
  "multiple-choice": "Multiple choice",
  "true-false": "True / False",
};

export function QuestionEditor({
  quizId,
  initialQuestions,
}: {
  quizId: string;
  initialQuestions: QuizQuestion[];
}) {
  const supabase = React.useMemo(() => createClient(), []);
  const [questions, setQuestions] = React.useState(initialQuestions);

  const addQuestion = async () => {
    try {
      const created = await createQuizQuestion(supabase, {
        quizId,
        question: "New question",
        type: "single-choice",
        order: questions.length + 1,
      });
      setQuestions((prev) => [...prev, created]);
    } catch (error) {
      notify.error("Couldn't add question", error instanceof Error ? error.message : undefined);
    }
  };

  const saveQuestionText = async (id: string, question: string) => {
    const target = questions.find((q) => q.id === id);
    if (!target) return;
    try {
      await updateQuizQuestion(supabase, id, { question, type: target.type, order: target.order });
    } catch (error) {
      notify.error("Couldn't save question", error instanceof Error ? error.message : undefined);
    }
  };

  const setQuestionType = async (id: string, type: QuizQuestionType) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, type } : q)));
    const target = questions.find((q) => q.id === id);
    if (!target) return;
    try {
      await updateQuizQuestion(supabase, id, { question: target.question, type, order: target.order });
    } catch (error) {
      notify.error("Couldn't update question type", error instanceof Error ? error.message : undefined);
    }
  };

  const removeQuestion = async (id: string) => {
    try {
      await deleteQuizQuestion(supabase, id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      notify.error("Couldn't delete question", error instanceof Error ? error.message : undefined);
    }
  };

  const addOption = async (questionId: string) => {
    try {
      const created = await createQuizOption(supabase, questionId, "New option", false);
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, options: [...q.options, created] } : q))
      );
    } catch (error) {
      notify.error("Couldn't add option", error instanceof Error ? error.message : undefined);
    }
  };

  const saveOptionText = async (questionId: string, optionId: string, text: string) => {
    const question = questions.find((q) => q.id === questionId);
    const option = question?.options.find((o) => o.id === optionId);
    if (!option) return;
    try {
      await updateQuizOption(supabase, optionId, text, option.isCorrect);
    } catch (error) {
      notify.error("Couldn't save option", error instanceof Error ? error.message : undefined);
    }
  };

  const setOptionCorrect = async (questionId: string, optionId: string, isCorrect: boolean) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.map((o) => (o.id === optionId ? { ...o, isCorrect } : o)) }
          : q
      )
    );
    const question = questions.find((q) => q.id === questionId);
    const option = question?.options.find((o) => o.id === optionId);
    if (!option) return;
    try {
      await updateQuizOption(supabase, optionId, option.text, isCorrect);
    } catch (error) {
      notify.error("Couldn't update option", error instanceof Error ? error.message : undefined);
    }
  };

  const removeOption = async (questionId: string, optionId: string) => {
    try {
      await deleteQuizOption(supabase, optionId);
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, options: q.options.filter((o) => o.id !== optionId) } : q))
      );
    } catch (error) {
      notify.error("Couldn't delete option", error instanceof Error ? error.message : undefined);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          {questions.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No questions yet — add the first one below.</p>
          ) : (
            <Accordion type="multiple" defaultValue={questions.map((q) => q.id)}>
              {questions.map((question, idx) => (
                <AccordionItem key={question.id} value={question.id}>
                  <AccordionTrigger className="text-left">
                    <span className="flex-1">
                      Q{idx + 1}. {question.question || "Untitled question"}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 px-1 pb-2">
                      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                        <Input
                          defaultValue={question.question}
                          onBlur={(e) => saveQuestionText(question.id, e.target.value)}
                          placeholder="Question text"
                        />
                        <Select
                          value={question.type}
                          onValueChange={(v) => setQuestionType(question.id, v as QuizQuestionType)}
                        >
                          <SelectTrigger className="sm:w-44">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TYPE_LABEL).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <div key={option.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                            <Input
                              defaultValue={option.text}
                              onBlur={(e) => saveOptionText(question.id, option.id, e.target.value)}
                              placeholder="Option text"
                              className="flex-1"
                            />
                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                              Correct
                              <Switch
                                checked={option.isCorrect}
                                onCheckedChange={(checked) => setOptionCorrect(question.id, option.id, checked)}
                              />
                            </label>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeOption(question.id, option.id)}
                              aria-label="Delete option"
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                        <Button size="sm" variant="outline" onClick={() => addOption(question.id)}>
                          <Plus className="size-4" aria-hidden="true" />
                          Add option
                        </Button>
                      </div>

                      <div className="flex justify-end border-t border-border pt-3">
                        <Button size="sm" variant="ghost" onClick={() => removeQuestion(question.id)}>
                          <Trash2 className="size-4 text-destructive" />
                          Delete question
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <Button onClick={addQuestion}>
        <Plus className="size-4" aria-hidden="true" />
        Add question
      </Button>
    </div>
  );
}
