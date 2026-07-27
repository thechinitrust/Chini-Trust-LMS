import type { QuizQuestion } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { QuizOption } from "@/components/shared/quiz-option";

interface QuizCardProps {
  question: QuizQuestion;
  index: number;
  total: number;
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
  reviewMode?: boolean;
}

export function QuizCard({ question, index, total, selectedOptionId, onSelect, reviewMode }: QuizCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Question {index + 1} of {total}
        </p>
        <h3 className="text-lg font-semibold text-foreground">{question.question}</h3>
        <div className="space-y-2">
          {question.options.map((option) => (
            <QuizOption
              key={option.id}
              option={option}
              selected={selectedOptionId === option.id}
              onSelect={() => onSelect(option.id)}
              reviewMode={reviewMode}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
