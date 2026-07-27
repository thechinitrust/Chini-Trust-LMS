"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, NotebookText } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { useLocalProgress } from "@/hooks/use-local-progress";
import { notify } from "@/lib/toast";
import {
  getCourseById,
  getLessonById,
  getModuleById,
  getModulesForCourse,
  getLessonsForModule,
  getNextLesson,
  getPreviousLesson,
  mockResources,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YouTubeEmbedPlayer } from "@/components/shared/youtube-embed-player";
import { ModuleList } from "@/components/shared/module-list";

export default function LessonPage() {
  const params = useParams<{ lessonId: string }>();
  const lesson = getLessonById(params.lessonId);
  const { user } = useAuth();
  const progress = useLocalProgress(user?.id ?? "anonymous");

  if (!lesson) notFound();

  const course = getCourseById(lesson.courseId);
  const courseModule = getModuleById(lesson.moduleId);
  if (!course || !courseModule) notFound();

  const modules = getModulesForCourse(course.id);
  const lessonsByModule = Object.fromEntries(modules.map((m) => [m.id, getLessonsForModule(m.id)]));
  const nextLesson = getNextLesson(lesson.id);
  const prevLesson = getPreviousLesson(lesson.id);
  const resources = mockResources.filter((r) => lesson.resourceIds.includes(r.id));
  const isCompleted = progress.isLessonCompleted(lesson.id);

  const handleComplete = () => {
    progress.markLessonComplete(lesson.id);
    notify.success("Lesson complete", "Nice work — your progress has been saved.");
  };

  return (
    <div className="container-page py-10">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={`/courses/${course.id}`} className="hover:text-primary">
          {course.title}
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/courses/${course.id}/modules/${courseModule.id}`} className="hover:text-primary">
          {courseModule.title}
        </Link>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <YouTubeEmbedPlayer youtubeVideoId={lesson.video.youtubeVideoId} title={lesson.title} />

          <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{lesson.title}</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">{lesson.description}</p>
            </div>
            {isCompleted ? (
              <Badge variant="success" className="shrink-0 gap-1.5">
                <CheckCircle2 className="size-3.5" aria-hidden="true" /> Completed
              </Badge>
            ) : (
              <Button onClick={handleComplete} className="shrink-0">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Mark complete
              </Button>
            )}
          </div>

          {lesson.notes && (
            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <NotebookText className="size-4 text-primary" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-foreground">Notes & summary</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{lesson.notes}</p>
            </div>
          )}

          {resources.length > 0 && (
            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-primary" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-foreground">Resources</h2>
              </div>
              <ul className="mt-3 space-y-2">
                {resources.map((resource) => (
                  <li key={resource.id}>
                    <a href={resource.fileUrl} download className="text-sm font-medium text-primary hover:underline">
                      {resource.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            {prevLesson ? (
              <Button variant="outline" asChild>
                <Link href={`/lessons/${prevLesson.id}`}>
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Previous
                </Link>
              </Button>
            ) : (
              <span />
            )}
            {nextLesson ? (
              <Button asChild>
                <Link href={`/lessons/${nextLesson.id}`}>
                  Next lesson
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link href={`/courses/${course.id}/modules/${courseModule.id}`}>
                  Back to module
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        <aside className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Course content
          </h2>
          <ModuleList
            modules={modules}
            lessonsByModule={lessonsByModule}
            completedLessonIds={progress.completedLessonIds}
            activeLessonId={lesson.id}
          />
        </aside>
      </div>
    </div>
  );
}
