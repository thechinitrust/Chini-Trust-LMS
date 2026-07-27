"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { Award, CheckCircle2, Clock, Layers, PlayCircle } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { useLocalProgress } from "@/hooks/use-local-progress";
import { notify } from "@/lib/toast";
import {
  getCourseById,
  getEnrollment,
  getLessonsForCourse,
  getLessonsForModule,
  getModulesForCourse,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/shared/progress-bar";
import { ModuleList } from "@/components/shared/module-list";

const AUDIENCE_LABEL: Record<string, string> = {
  students: "Students",
  parents: "Parents",
  teachers: "Teachers",
  employers: "Employers",
  "neurodivergent-individuals": "Neurodivergent individuals",
};

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const course = getCourseById(params.courseId);
  const { user } = useAuth();
  const progressHook = useLocalProgress(user?.id ?? "anonymous");
  const [localEnrolled, setLocalEnrolled] = React.useState(false);

  if (!course) notFound();

  const modules = getModulesForCourse(course.id);
  const lessons = getLessonsForCourse(course.id);
  const lessonsByModule = Object.fromEntries(modules.map((m) => [m.id, getLessonsForModule(m.id)]));
  const enrollment = user ? getEnrollment(user.id, course.id) : undefined;
  const isEnrolled = Boolean(enrollment) || localEnrolled;
  const percent = user ? progressHook.courseProgressPercent(course.id) : 0;

  const firstIncompleteLesson = lessons.find((l) => !progressHook.isLessonCompleted(l.id)) ?? lessons[0];

  const handleEnroll = () => {
    setLocalEnrolled(true);
    notify.success("Enrolled", `You're enrolled in ${course.title}.`);
  };

  return (
    <div className="container-page py-12">
      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Badge variant="outline" className="capitalize">
            {course.category}
          </Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{course.title}</h1>
          <p className="mt-3 text-muted-foreground">{course.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {course.audience.map((a) => (
              <Badge key={a} variant="secondary">
                {AUDIENCE_LABEL[a] ?? a}
              </Badge>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden="true" /> {course.estimatedMinutes} min
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="size-4" aria-hidden="true" /> {modules.length} modules &middot; {lessons.length} lessons
            </span>
            <span className="flex items-center gap-1.5 capitalize">
              <PlayCircle className="size-4" aria-hidden="true" /> {course.level}
            </span>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">Learning objectives</h2>
            <ul className="mt-3 space-y-2">
              {course.objectives.map((obj) => (
                <li key={obj} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold text-foreground">Course content</h2>
            <div className="mt-4">
              <ModuleList
                modules={modules}
                lessonsByModule={lessonsByModule}
                completedLessonIds={progressHook.completedLessonIds}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="sticky top-24 space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted">
              <Image src={course.thumbnailUrl} alt="" fill className="object-cover" sizes="320px" />
            </div>

            {user && isEnrolled && <ProgressBar value={percent} label="Your progress" />}

            {!user ? (
              <Button className="w-full" asChild>
                <Link href="/login">Log in to enroll</Link>
              </Button>
            ) : isEnrolled ? (
              <Button className="w-full" asChild>
                <Link href={`/lessons/${firstIncompleteLesson?.id ?? lessons[0]?.id}`}>
                  {percent > 0 ? "Continue learning" : "Start course"}
                </Link>
              </Button>
            ) : (
              <Button className="w-full" onClick={handleEnroll}>
                Enroll now
              </Button>
            )}

            {course.requiresCertificate && (
              <div className="flex items-start gap-2 rounded-lg bg-secondary/60 p-3 text-xs text-secondary-foreground">
                <Award className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Complete every module and pass each quiz to earn a certificate for this course.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
