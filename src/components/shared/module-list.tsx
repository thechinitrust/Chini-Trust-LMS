import type { Lesson, Module } from "@/lib/types";
import { LessonCard } from "@/components/shared/lesson-card";

interface ModuleListProps {
  modules: Module[];
  lessonsByModule: Record<string, Lesson[]>;
  completedLessonIds?: Set<string>;
  activeLessonId?: string;
}

export function ModuleList({ modules, lessonsByModule, completedLessonIds, activeLessonId }: ModuleListProps) {
  return (
    <div className="space-y-7">
      {modules.map((module, idx) => (
        <div key={module.id}>
          <p className="mb-1 text-xs font-medium tracking-widest text-primary-text uppercase">Module {idx + 1}</p>
          <h3 className="mb-2 font-semibold text-foreground">{module.title}</h3>
          <div className="space-y-0.5">
            {(lessonsByModule[module.id] ?? []).map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                completed={completedLessonIds?.has(lesson.id)}
                active={activeLessonId === lesson.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
