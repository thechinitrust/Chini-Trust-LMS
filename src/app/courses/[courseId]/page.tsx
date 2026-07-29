import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, BookOpen, CheckCircle2, Clock, Layers, PlayCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCourseBySlug } from "@/lib/data/courses";
import { getModulesForCourse } from "@/lib/data/modules";
import { getLessonsForCourse, getLessonsForModule } from "@/lib/data/lessons";
import { getEnrollment } from "@/lib/data/enrollments";
import { getCourseCompletionPercent, getProgressForUser } from "@/lib/data/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { YouTubeEmbedPlayer } from "@/components/shared/youtube-embed-player";
import { CourseModuleAccordion } from "@/components/shared/course-module-accordion";
import { Reveal } from "@/components/motion/reveal";
import { CourseEnrollPanel } from "./course-enroll-panel";

const AUDIENCE_LABEL: Record<string, string> = {
  students: "Students",
  parents: "Parents",
  teachers: "Teachers",
  employers: "Employers",
  "neurodivergent-individuals": "Neurodivergent individuals",
};

const CATEGORY_LABEL: Record<string, string> = {
  autism: "Autism",
  adhd: "ADHD",
  dyslexia: "Dyslexia",
  workplace: "Workplace Inclusion",
};

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId: slug } = await params;
  const supabase = await createClient();

  const course = await getCourseBySlug(supabase, slug);
  if (!course) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [modules, lessons] = await Promise.all([
    getModulesForCourse(supabase, course.id),
    getLessonsForCourse(supabase, course.id),
  ]);
  const lessonsByModule = Object.fromEntries(
    await Promise.all(modules.map(async (m) => [m.id, await getLessonsForModule(supabase, m.id)] as const))
  );

  const enrollment = user ? await getEnrollment(supabase, user.id, course.id) : undefined;
  const isEnrolled = Boolean(enrollment);
  const percent = user && isEnrolled ? await getCourseCompletionPercent(supabase, user.id, course.id) : 0;
  const completedLessonIds = user
    ? new Set((await getProgressForUser(supabase, user.id)).filter((p) => p.completed).map((p) => p.lessonId))
    : new Set<string>();

  const introVideoId = course.previewVideoId ?? lessons[0]?.video.youtubeVideoId;
  const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
  const firstIncompleteLesson = lessons.find((l) => !completedLessonIds.has(l.id)) ?? lessons[0];

  return (
    <div className="container-page px-6 py-12 lg:px-12 lg:py-16" data-focus-content="true">
      {/* ---- Course header ---- */}
      <Reveal>
        <nav className="mb-5 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/learn" className="transition-colors hover:text-primary-text">
            Learn
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-foreground">{course.title}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand">{CATEGORY_LABEL[course.category] ?? course.category}</Badge>
          <Badge variant="outline" className="capitalize">
            {course.level}
          </Badge>
        </div>

        <h1 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          {course.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{course.summary}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-4 text-primary-text" strokeWidth={1.5} aria-hidden="true" />
            {course.estimatedMinutes} min
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="size-4 text-primary-text" strokeWidth={1.5} aria-hidden="true" />
            {modules.length} modules
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-4 text-primary-text" strokeWidth={1.5} aria-hidden="true" />
            {lessons.length} lessons
          </span>
          {course.requiresCertificate && (
            <span className="flex items-center gap-1.5">
              <Award className="size-4 text-primary-text" strokeWidth={1.5} aria-hidden="true" />
              Certificate on completion
            </span>
          )}
        </div>
      </Reveal>

      {/* ---- Intro video + enrolment rail ---- */}
      <div
        className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[1.7fr_minmax(0,1fr)]"
        data-focus-grid="true"
      >
        <Reveal className="min-w-0">
          {introVideoId ? (
            <figure>
              <YouTubeEmbedPlayer youtubeVideoId={introVideoId} title={`${course.title} — course introduction`} />
              <figcaption className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <PlayCircle className="size-3.5 text-primary-text" strokeWidth={1.5} aria-hidden="true" />
                Course introduction — start here, then work through the modules below.
              </figcaption>
            </figure>
          ) : (
            <Card tone="subtle" className="flex aspect-video items-center justify-center">
              <p className="text-sm text-muted-foreground">Intro video coming soon.</p>
            </Card>
          )}

          <div className="mt-10">
            <h2 className="font-serif text-2xl text-foreground">About this course</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{course.description}</p>
          </div>

          <div className="mt-10">
            <h2 className="font-serif text-2xl text-foreground">What you&apos;ll learn</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {course.objectives.map((obj) => (
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
          </div>

          {/* ---- Modules ---- */}
          <div className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-serif text-2xl text-foreground">Course content</h2>
              <p className="text-sm text-muted-foreground">
                {modules.length} modules &middot; {lessons.length} lessons
                {user && isEnrolled && ` · ${completedCount} completed`}
              </p>
            </div>
            <div className="mt-5">
              <CourseModuleAccordion
                modules={modules}
                lessonsByModule={lessonsByModule}
                completedLessonIds={completedLessonIds}
              />
            </div>
          </div>
        </Reveal>

        {/* ---- Sticky enrolment card ---- */}
        <Reveal delay={0.15} className="min-w-0" data-focus-aside="true">
          <Card tone="brand" elevation="lifted" className="sticky top-28">
            <CardContent className="space-y-5 p-6">
              <CourseEnrollPanel
                courseId={course.id}
                userId={user?.id ?? null}
                isEnrolled={isEnrolled}
                percent={percent}
                completedCount={completedCount}
                lessonCount={lessons.length}
                moduleCount={modules.length}
                requiresCertificate={course.requiresCertificate}
                firstLessonHref={
                  firstIncompleteLesson ? `/lessons/${firstIncompleteLesson.id}` : undefined
                }
              />

              <div className="flex flex-wrap gap-1.5 border-t border-primary/15 pt-5">
                {course.audience.map((a) => (
                  <Badge key={a} variant="secondary" className="text-[11px]">
                    {AUDIENCE_LABEL[a] ?? a}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
