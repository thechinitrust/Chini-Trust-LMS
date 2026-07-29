"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Layers, Loader2, PlayCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { enrollInCourse } from "@/lib/data/enrollments";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/shared/progress-bar";

interface CourseEnrollPanelProps {
  courseId: string;
  userId: string | null;
  isEnrolled: boolean;
  percent: number;
  completedCount: number;
  lessonCount: number;
  moduleCount: number;
  requiresCertificate: boolean;
  firstLessonHref?: string;
}

export function CourseEnrollPanel({
  courseId,
  userId,
  isEnrolled,
  percent,
  completedCount,
  lessonCount,
  moduleCount,
  requiresCertificate,
  firstLessonHref,
}: CourseEnrollPanelProps) {
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = React.useState(false);

  const handleEnroll = async () => {
    if (!userId) return;
    setIsEnrolling(true);
    try {
      const supabase = createClient();
      await enrollInCourse(supabase, userId, courseId);
      notify.success("Enrolled", "You're all set -- start with the first lesson.");
      router.refresh();
    } catch (error) {
      notify.error("Couldn't enroll", error instanceof Error ? error.message : undefined);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <>
      {userId && isEnrolled ? (
        <>
          <ProgressBar value={percent} label="Your progress" />
          <p className="text-xs text-muted-foreground">
            {completedCount} of {lessonCount} lessons complete
          </p>
        </>
      ) : (
        <div>
          <p className="font-serif text-2xl text-foreground">Free</p>
          <p className="mt-1 text-sm text-muted-foreground">Full access, no payment required.</p>
        </div>
      )}

      {!userId ? (
        <Button className="w-full" size="lg" asChild>
          <Link href="/login">Log in to enroll</Link>
        </Button>
      ) : isEnrolled ? (
        <Button className="w-full" size="lg" asChild>
          <Link href={firstLessonHref ?? "#"}>{percent > 0 ? "Continue learning" : "Start course"}</Link>
        </Button>
      ) : (
        <Button className="w-full" size="lg" onClick={handleEnroll} disabled={isEnrolling}>
          {isEnrolling && <Loader2 className="size-4 animate-spin" />}
          Enroll now
        </Button>
      )}

      <div className="space-y-2.5 border-t border-primary/15 pt-5">
        <p className="text-xs font-medium tracking-widest text-primary-text uppercase">This course includes</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <PlayCircle className="size-4 shrink-0 text-primary" strokeWidth={1.5} aria-hidden="true" />
            {lessonCount} video lessons
          </li>
          <li className="flex items-center gap-2">
            <Layers className="size-4 shrink-0 text-primary" strokeWidth={1.5} aria-hidden="true" />
            {moduleCount} structured modules
          </li>
          {requiresCertificate && (
            <li className="flex items-center gap-2">
              <Award className="size-4 shrink-0 text-primary" strokeWidth={1.5} aria-hidden="true" />
              Certificate of completion
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
