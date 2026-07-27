"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ArrowRight, FileText, ListChecks } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { useLocalProgress } from "@/hooks/use-local-progress";
import {
  getCourseById,
  getModuleById,
  getLessonsForModule,
  getQuizForModule,
  mockResources,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LessonCard } from "@/components/shared/lesson-card";

export default function ModulePage() {
  const params = useParams<{ courseId: string; moduleId: string }>();
  const course = getCourseById(params.courseId);
  const courseModule = getModuleById(params.moduleId);
  const { user } = useAuth();
  const progress = useLocalProgress(user?.id ?? "anonymous");

  if (!course || !courseModule || courseModule.courseId !== course.id) notFound();

  const lessons = getLessonsForModule(courseModule.id);
  const quiz = getQuizForModule(courseModule.id);
  const resources = mockResources.filter((r) => lessons.some((l) => l.resourceIds.includes(r.id)));

  return (
    <div className="container-page py-12">
      <nav className="text-sm text-muted-foreground">
        <Link href={`/courses/${course.id}`} className="hover:text-primary">
          {course.title}
        </Link>
      </nav>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{courseModule.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{courseModule.description}</p>
        </div>
        <Badge variant="outline">{lessons.length} lessons</Badge>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-1">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} completed={progress.isLessonCompleted(lesson.id)} />
          ))}
        </div>

        <div className="space-y-6">
          {quiz && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <ListChecks className="size-5 text-primary" aria-hidden="true" />
                <h2 className="font-semibold text-foreground">Module quiz</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{quiz.description}</p>
              <Button className="mt-4 w-full" asChild>
                <Link href={`/quizzes/${quiz.id}`}>
                  Take the quiz
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          )}

          {resources.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-primary" aria-hidden="true" />
                <h2 className="font-semibold text-foreground">Related resources</h2>
              </div>
              <ul className="mt-3 space-y-2">
                {resources.map((resource) => (
                  <li key={resource.id}>
                    <a
                      href={resource.fileUrl}
                      download
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {resource.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
