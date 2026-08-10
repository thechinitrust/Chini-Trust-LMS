"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { upsertLessonProgress } from "@/lib/data/progress";
import { notify } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YouTubeEmbedPlayer } from "@/components/shared/youtube-embed-player";
import { RichText } from "@/components/shared/rich-text";

interface LessonPlayerProps {
  lessonId: string;
  courseId: string;
  title: string;
  description: string;
  lessonPosition: string;
  youtubeVideoId: string;
  durationSeconds: number;
  userId: string | null;
  enrollmentId: string | null;
  initialWatchedSeconds: number;
  initialCompleted: boolean;
}

export function LessonPlayer({
  lessonId,
  courseId,
  title,
  description,
  lessonPosition,
  youtubeVideoId,
  durationSeconds,
  userId,
  enrollmentId,
  initialWatchedSeconds,
  initialCompleted,
}: LessonPlayerProps) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  const [completed, setCompleted] = React.useState(initialCompleted);
  const [isMarking, setIsMarking] = React.useState(false);
  const completedRef = React.useRef(initialCompleted);
  completedRef.current = completed;

  const persist = React.useCallback(
    async (watchedSeconds: number, isCompleted: boolean) => {
      if (!userId || !enrollmentId) return;
      await upsertLessonProgress(supabase, {
        userId,
        lessonId,
        enrollmentId,
        courseId,
        watchedSeconds,
        completed: isCompleted,
      });
    },
    [supabase, userId, lessonId, enrollmentId, courseId]
  );

  const handleProgress = React.useCallback(
    (seconds: number) => {
      // Best-effort background write -- don't surface a toast for every
      // periodic tick, just let it fail silently if e.g. offline.
      persist(seconds, completedRef.current).catch(() => {});
    },
    [persist]
  );

  const handleAutoComplete = React.useCallback(() => {
    if (completedRef.current) return;
    setCompleted(true);
    persist(durationSeconds, true)
      .then(() => router.refresh())
      .catch(() => {});
  }, [persist, durationSeconds, router]);

  const handleManualComplete = async () => {
    setIsMarking(true);
    try {
      await persist(durationSeconds, true);
      setCompleted(true);
      notify.success("Lesson complete", "Nice work — your progress has been saved.");
      router.refresh();
    } catch (error) {
      notify.error("Couldn't save progress", error instanceof Error ? error.message : undefined);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <>
      <YouTubeEmbedPlayer
        youtubeVideoId={youtubeVideoId}
        title={title}
        initialSeconds={initialWatchedSeconds}
        onProgress={userId && enrollmentId ? handleProgress : undefined}
        onComplete={userId && enrollmentId ? handleAutoComplete : undefined}
      />

      <div className="mt-7 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-widest text-primary-text uppercase">{lessonPosition}</p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">{title}</h1>
          <RichText html={description} className="mt-3 max-w-2xl leading-relaxed text-muted-foreground" />
        </div>
        {userId ? (
          completed ? (
            <Badge variant="success" className="shrink-0 gap-1.5 px-3.5 py-1.5">
              <CheckCircle2 className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> Completed
            </Badge>
          ) : (
            <Button onClick={handleManualComplete} disabled={isMarking} className="shrink-0">
              <CheckCircle2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Mark complete
            </Button>
          )
        ) : (
          <Badge variant="outline" className="shrink-0">
            Log in to track progress
          </Badge>
        )}
      </div>
    </>
  );
}
