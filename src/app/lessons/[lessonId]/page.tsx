import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, FileText, ListChecks, NotebookText, Target } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCourseById } from "@/lib/data/courses";
import { getLessonById, getLessonsForCourse, getLessonsForModule, getNextLesson, getPreviousLesson } from "@/lib/data/lessons";
import { getModuleById, getModulesForCourse } from "@/lib/data/modules";
import { getQuizForModule } from "@/lib/data/quizzes";
import { getResourcesForLesson } from "@/lib/data/resources";
import { enrollInCourse, getEnrollment } from "@/lib/data/enrollments";
import { getCourseCompletionPercent, getProgressForLesson, getProgressForUser } from "@/lib/data/progress";
import { formatDuration } from "@/lib/youtube";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModuleList } from "@/components/shared/module-list";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Reveal } from "@/components/motion/reveal";
import { LessonPlayer } from "./lesson-player";

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const supabase = await createClient();

  const lesson = await getLessonById(supabase, lessonId);
  if (!lesson) notFound();

  const [course, courseModule] = await Promise.all([
    getCourseById(supabase, lesson.courseId),
    getModuleById(supabase, lesson.moduleId),
  ]);
  if (!course || !courseModule) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  // A learner deep-linking straight to a lesson without having visited the
  // course page yet still needs an enrollment row for progress writes to be
  // valid (the guard_progress_enrollment trigger requires it) -- auto-enroll
  // here rather than erroring.
  let enrollment = userId ? await getEnrollment(supabase, userId, course.id) : undefined;
  if (userId && !enrollment) {
    enrollment = await enrollInCourse(supabase, userId, course.id);
  }

  const [modules, courseLessons, nextLesson, prevLesson, resources, moduleQuiz, lessonProgress, progressRows] =
    await Promise.all([
      getModulesForCourse(supabase, course.id),
      getLessonsForCourse(supabase, course.id),
      getNextLesson(supabase, lesson.id),
      getPreviousLesson(supabase, lesson.id),
      getResourcesForLesson(supabase, lesson.id),
      getQuizForModule(supabase, courseModule.id),
      userId ? getProgressForLesson(supabase, userId, lesson.id) : Promise.resolve(undefined),
      userId ? getProgressForUser(supabase, userId) : Promise.resolve([]),
    ]);
  const lessonsByModule = Object.fromEntries(
    await Promise.all(modules.map(async (m) => [m.id, await getLessonsForModule(supabase, m.id)] as const))
  );
  const completedLessonIds = new Set(progressRows.filter((p) => p.completed).map((p) => p.lessonId));
  const coursePercent = userId ? await getCourseCompletionPercent(supabase, userId, course.id) : 0;

  const lessonIndex = courseLessons.findIndex((l) => l.id === lesson.id);
  const isLastInModule = (lessonsByModule[courseModule.id] ?? []).at(-1)?.id === lesson.id;

  return (
    <div className="container-page px-6 py-10 lg:px-12 lg:py-14" data-focus-content="true">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href={`/courses/${course.slug}`} className="transition-colors hover:text-primary-text">
          {course.title}
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/courses/${course.slug}/modules/${courseModule.id}`}
          className="transition-colors hover:text-primary-text"
        >
          {courseModule.title}
        </Link>
      </nav>

      <div
        className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[1.65fr_minmax(0,1fr)]"
        data-focus-grid="true"
      >
        <Reveal className="min-w-0">
          <LessonPlayer
            lessonId={lesson.id}
            courseId={course.id}
            title={lesson.title}
            description={lesson.description}
            lessonPosition={`Lesson ${lessonIndex + 1} of ${courseLessons.length} · ${formatDuration(lesson.video.durationSeconds)}`}
            youtubeVideoId={lesson.video.youtubeVideoId}
            durationSeconds={lesson.video.durationSeconds}
            userId={userId ?? null}
            enrollmentId={enrollment?.id ?? null}
            initialWatchedSeconds={lessonProgress?.watchedSeconds ?? 0}
            initialCompleted={lessonProgress?.completed ?? false}
          />

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
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.5} aria-hidden="true" />
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
                          <span className="block truncate text-sm font-medium text-foreground">{resource.title}</span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{resource.summary}</span>
                        </span>
                        <Download className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" strokeWidth={1.5} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* ---- End-of-module quiz prompt ----
              Only shown for optional quizzes, as an ungated self-check.
              Required quizzes aren't forced per-module -- they're
              surfaced on the course overview page once every lesson in
              the course is complete (see [courseId]/page.tsx). */}
          {isLastInModule && moduleQuiz && !moduleQuiz.isRequired && (
            <Card tone="brand" className="mt-6 card-brand-rail">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div className="flex items-start gap-3">
                  <ListChecks className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">You&apos;ve reached the end of this module</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try the optional {courseModule.title} quiz to check your understanding.
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
                <Link href={`/courses/${course.slug}`}>
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
                  <Link href={`/courses/${course.slug}`}>Course overview</Link>
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
                    completedLessonIds={completedLessonIds}
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
