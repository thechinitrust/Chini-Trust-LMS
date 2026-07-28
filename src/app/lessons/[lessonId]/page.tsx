"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  ListChecks,
  NotebookText,
  Target,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { useLocalProgress } from "@/hooks/use-local-progress";
import { notify } from "@/lib/toast";
import { formatDuration } from "@/lib/youtube";
import {
  getCourseById,
  getLessonById,
  getModuleById,
  getModulesForCourse,
  getLessonsForModule,
  getLessonsForCourse,
  getNextLesson,
  getPreviousLesson,
  getQuizForModule,
  mockResources,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { YouTubeEmbedPlayer } from "@/components/shared/youtube-embed-player";
import { ModuleList } from "@/components/shared/module-list";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Reveal } from "@/components/motion/reveal";

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
  const courseLessons = getLessonsForCourse(course.id);
  const nextLesson = getNextLesson(lesson.id);
  const prevLesson = getPreviousLesson(lesson.id);
  const resources = mockResources.filter((r) => lesson.resourceIds.includes(r.id));
  const moduleQuiz = getQuizForModule(courseModule.id);
  const isCompleted = progress.isLessonCompleted(lesson.id);

  const lessonIndex = courseLessons.findIndex((l) => l.id === lesson.id);
  const coursePercent = progress.courseProgressPercent(course.id);
  const isLastInModule = (lessonsByModule[courseModule.id] ?? []).at(-1)?.id === lesson.id;

  const handleComplete = () => {
    progress.markLessonComplete(lesson.id);
    notify.success("Lesson complete", "Nice work — your progress has been saved.");
  };

  return (
    <div className="container-page px-6 py-10 lg:px-12 lg:py-14" data-focus-content="true">
      <nav
        className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link href={`/courses/${course.id}`} className="transition-colors hover:text-primary-text">
          {course.title}
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/courses/${course.id}/modules/${courseModule.id}`}
          className="transition-colors hover:text-primary-text"
        >
          {courseModule.title}
        </Link>
      </nav>

      {/* minmax(0,…) + min-w-0 keep the video iframe from forcing the grid wider than the viewport */}
      <div
        className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[1.65fr_minmax(0,1fr)]"
        data-focus-grid="true"
      >
        <Reveal className="min-w-0">
          {/* ---- Lesson video ---- */}
          <YouTubeEmbedPlayer youtubeVideoId={lesson.video.youtubeVideoId} title={lesson.title} />

          <div className="mt-7 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-widest text-primary-text uppercase">
                Lesson {lessonIndex + 1} of {courseLessons.length} &middot;{" "}
                {formatDuration(lesson.video.durationSeconds)}
              </p>
              <h1 className="mt-2 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
                {lesson.title}
              </h1>
              <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{lesson.description}</p>
            </div>
            {isCompleted ? (
              <Badge variant="success" className="shrink-0 gap-1.5 px-3.5 py-1.5">
                <CheckCircle2 className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> Completed
              </Badge>
            ) : (
              <Button onClick={handleComplete} className="shrink-0">
                <CheckCircle2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
                Mark complete
              </Button>
            )}
          </div>

          {/* ---- Lesson objectives ---- */}
          {lesson.objectives && lesson.objectives.length > 0 && (
            <Card tone="brand" className="mt-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-2.5">
                  <Target className="size-4 text-primary" strokeWidth={1.5} aria-hidden="true" />
                  <h2 className="text-sm font-semibold text-foreground">In this lesson you&apos;ll learn to</h2>
                </div>
                <ul className="mt-3.5 space-y-2.5">
                  {lesson.objectives.map((obj) => (
                    <li key={obj} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      {obj}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* ---- Notes ---- */}
          {lesson.notes && (
            <Card tone="subtle" className="mt-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-2.5">
                  <NotebookText className="size-4 text-primary" strokeWidth={1.5} aria-hidden="true" />
                  <h2 className="text-sm font-semibold text-foreground">Notes &amp; summary</h2>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{lesson.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* ---- Downloadable resources ---- */}
          {resources.length > 0 && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-2.5">
                  <FileText className="size-4 text-primary" strokeWidth={1.5} aria-hidden="true" />
                  <h2 className="text-sm font-semibold text-foreground">Downloadable resources</h2>
                </div>
                <ul className="mt-3.5 space-y-2">
                  {resources.map((resource) => (
                    <li key={resource.id}>
                      <a
                        href={resource.fileUrl}
                        download
                        className="group flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 transition-all hover:border-primary/40 hover:bg-primary/8"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {resource.title}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {resource.summary}
                          </span>
                        </span>
                        <Download
                          className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* ---- End-of-module quiz prompt ---- */}
          {isLastInModule && moduleQuiz && (
            <Card tone="brand" className="mt-6 card-brand-rail">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div className="flex items-start gap-3">
                  <ListChecks className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">You&apos;ve reached the end of this module</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Check your understanding with the {courseModule.title} quiz.
                    </p>
                  </div>
                </div>
                <Button asChild>
                  <Link href={`/quizzes/${moduleQuiz.id}`}>
                    Take the quiz
                    <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ---- Prev / next ---- */}
          <div className="mt-9 flex items-center justify-between gap-3">
            {prevLesson ? (
              <Button variant="outline" asChild>
                <Link href={`/lessons/${prevLesson.id}`}>
                  <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden="true" />
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
                  <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link href={`/courses/${course.id}`}>
                  Back to course
                  <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </Button>
            )}
          </div>
        </Reveal>

        {/* ---- Course-content sidebar ---- */}
        <Reveal delay={0.15} className="min-w-0" data-focus-aside="true">
          <aside className="sticky top-28 space-y-5">
            <Card tone="subtle">
              <CardContent className="p-6">
                <ProgressBar value={coursePercent} label="Course progress" />
                <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                  <Link href={`/courses/${course.id}`}>Course overview</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                  Course content
                </h2>
                <div className="max-h-[28rem] overflow-y-auto pr-1">
                  <ModuleList
                    modules={modules}
                    lessonsByModule={lessonsByModule}
                    completedLessonIds={progress.completedLessonIds}
                    activeLessonId={lesson.id}
                  />
                </div>
              </CardContent>
            </Card>
          </aside>
        </Reveal>
      </div>
    </div>
  );
}
