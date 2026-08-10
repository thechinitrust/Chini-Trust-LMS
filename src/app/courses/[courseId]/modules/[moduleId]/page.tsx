import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileText, ListChecks } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCourseBySlug } from "@/lib/data/courses";
import { getModuleById } from "@/lib/data/modules";
import { getLessonsForModule } from "@/lib/data/lessons";
import { getQuizForModule } from "@/lib/data/quizzes";
import { getResourcesForModule } from "@/lib/data/resources";
import { getProgressForUser } from "@/lib/data/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RichText } from "@/components/shared/rich-text";
import { LessonCard } from "@/components/shared/lesson-card";
import { Reveal } from "@/components/motion/reveal";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}) {
  const { courseId: courseSlug, moduleId } = await params;
  const supabase = await createClient();

  const course = await getCourseBySlug(supabase, courseSlug);
  if (!course) notFound();

  const courseModule = await getModuleById(supabase, moduleId);
  if (!courseModule || courseModule.courseId !== course.id) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  const [lessons, quiz, completedLessonIds] = await Promise.all([
    getLessonsForModule(supabase, courseModule.id),
    getQuizForModule(supabase, courseModule.id),
    userId
      ? getProgressForUser(supabase, userId).then(
          (rows) => new Set(rows.filter((p) => p.completed).map((p) => p.lessonId))
        )
      : Promise.resolve(new Set<string>()),
  ]);
  const resources = await getResourcesForModule(
    supabase,
    courseModule.id,
    lessons.map((l) => l.id)
  );

  return (
    <div className="container-page px-6 py-16 lg:px-12" data-focus-content="true">
      <Reveal>
        <nav className="text-sm text-muted-foreground">
          <Link href={`/courses/${course.slug}`} className="hover:text-primary-text">
            {course.title}
          </Link>
        </nav>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">{courseModule.title}</h1>
            <RichText html={courseModule.description} className="mt-3 max-w-2xl text-muted-foreground" />
          </div>
          <Badge variant="outline">{lessons.length} lessons</Badge>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]" data-focus-grid="true">
        <Reveal delay={0.1} className="space-y-1">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} completed={completedLessonIds.has(lesson.id)} />
          ))}
        </Reveal>

        <Reveal delay={0.2} className="space-y-6" data-focus-aside="true">
          {quiz && (
            <div className="rounded-2xl border border-black/5 bg-card p-6 shadow-soft dark:border-white/10">
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <ListChecks className="size-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
                  <h2 className="font-semibold text-foreground">Module quiz</h2>
                </div>
                <Badge variant={quiz.isRequired ? "brand" : "outline"}>
                  {quiz.isRequired ? "Required" : "Optional"}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{quiz.description}</p>
              <Button className="mt-5 w-full" asChild>
                <Link href={`/quizzes/${quiz.id}`}>
                  Take the quiz
                  <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </Button>
            </div>
          )}

          {resources.length > 0 && (
            <div className="rounded-2xl border border-black/5 bg-card p-6 shadow-soft dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <FileText className="size-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
                <h2 className="font-semibold text-foreground">Related resources</h2>
              </div>
              <ul className="mt-3 space-y-2">
                {resources.map((resource) => (
                  <li key={resource.id}>
                    <a href={resource.fileUrl} download className="text-sm font-medium text-primary-text hover:underline">
                      {resource.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}
