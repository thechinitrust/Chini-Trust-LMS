"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { QuizOption as QuizOptionType } from "@/lib/types";

interface QuizOptionProps {
  option: QuizOptionType;
  selected: boolean;
  onSelect: () => void;
  /** When set, renders in review mode (post-submit) instead of interactive mode. */
  reviewMode?: boolean;
  disabled?: boolean;
}

export function QuizOption({ option, selected, onSelect, reviewMode, disabled }: QuizOptionProps) {
  const showCorrect = reviewMode && option.isCorrect;
  const showIncorrect = reviewMode && selected && !option.isCorrect;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled || reviewMode}
      aria-pressed={selected}
      whileTap={reviewMode || disabled ? undefined : { scale: 0.99 }}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors",
        selected && !reviewMode && "border-primary bg-primary/5 text-primary-text",
        !selected && !reviewMode && "border-input hover:bg-muted",
        showCorrect && "border-success bg-success/10 text-success-text",
        showIncorrect && "border-destructive bg-destructive/10 text-destructive",
        reviewMode && !showCorrect && !showIncorrect && "border-border text-muted-foreground",
        (disabled || reviewMode) && "cursor-default"
      )}
    >
      <span>{option.text}</span>
      {showCorrect && <CheckCircle2 className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />}
      {showIncorrect && <XCircle className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />}
    </motion.button>
  );
}
