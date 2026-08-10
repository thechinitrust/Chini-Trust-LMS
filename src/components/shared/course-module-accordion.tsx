"use client";

import Link from "next/link";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";

import type { Lesson, Module } from "@/lib/types";
import { formatDuration } from "@/lib/youtube";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RichText } from "@/components/shared/rich-text";

interface CourseModuleAccordionProps {
  modules: Module[];
  lessonsByModule: Record<string, Lesson[]>;
  completedLessonIds?: Set<string>;
}

/**
 * Course-page module list: each module expands to reveal its lessons, and
 * every lesson links straight through to its own player page.
 */
export function CourseModuleAccordion({
  modules,
  lessonsByModule,
  completedLessonIds,
}: CourseModuleAccordionProps) {
  return (
    <Accordion
      type="multiple"
      defaultValue={modules.length > 0 ? [modules[0].id] : []}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
    >
      {modules.map((module, idx) => {
        const lessons = lessonsByModule[module.id] ?? [];
        const done = lessons.filter((l) => completedLessonIds?.has(l.id)).length;
        const allDone = lessons.length > 0 && done === lessons.length;
        const totalSeconds = lessons.reduce((sum, l) => sum + l.video.durationSeconds, 0);

        return (
          <AccordionItem key={module.id} value={module.id} className="border-border px-5 sm:px-6">
            <AccordionTrigger className="py-5 hover:no-underline">
              <span className="flex min-w-0 flex-1 items-start gap-3.5 text-left">
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    allDone ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary-text"
                  )}
                  aria-hidden="true"
                >
                  {allDone ? <CheckCircle2 className="size-4" strokeWidth={1.5} /> : idx + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-medium text-foreground">{module.title}</span>
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                    {lessons.length} lessons &middot; {Math.round(totalSeconds / 60)} min
                    {completedLessonIds && lessons.length > 0 && ` · ${done}/${lessons.length} complete`}
                  </span>
                </span>
              </span>
            </AccordionTrigger>

            <AccordionContent className="pb-5">
              <RichText html={module.description} className="mb-3 text-sm leading-relaxed text-muted-foreground" />
              <ul className="space-y-1">
                {lessons.map((lesson) => {
                  const completed = completedLessonIds?.has(lesson.id);
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/lessons/${lesson.id}`}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-primary/8"
                      >
                        {completed ? (
                          <CheckCircle2
                            className="size-4.5 shrink-0 text-primary"
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                        ) : (
                          <Circle
                            className="size-4.5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary"
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground group-hover:text-primary-text">
                            {lesson.title}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                          <PlayCircle className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                          {formatDuration(lesson.video.durationSeconds)}
                        </span>
                        {completed && <span className="sr-only">Completed</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
