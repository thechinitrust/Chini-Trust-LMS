import Link from "next/link";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";

import type { Lesson } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  lesson: Lesson;
  completed?: boolean;
  active?: boolean;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LessonCard({ lesson, completed, active }: LessonCardProps) {
  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:bg-muted",
        active && "border-primary/30 bg-primary/5"
      )}
      aria-current={active ? "true" : undefined}
    >
      {completed ? (
        <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
      ) : active ? (
        <PlayCircle className="size-5 shrink-0 text-primary" aria-hidden="true" />
      ) : (
        <Circle className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-sm font-medium", active ? "text-primary" : "text-foreground")}>
          {lesson.title}
        </span>
      </span>
      <span className="shrink-0 text-xs text-muted-foreground">
        {formatDuration(lesson.video.durationSeconds)}
      </span>
    </Link>
  );
}
