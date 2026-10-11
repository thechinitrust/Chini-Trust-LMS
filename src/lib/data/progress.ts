import type { SupabaseClient } from "@supabase/supabase-js";

import type { LessonProgress } from "@/lib/types";
import { getLessonsForCourse } from "@/lib/data/lessons";
import { getLatestPassingAttempt, getQuizzesForCourse } from "@/lib/data/quizzes";

interface ProgressRow {
  id: string;
  user_id: string;
  lesson_id: string;
  enrollment_id: string;
  watched_seconds: number;
  completed: boolean;
  last_watched_at: string;
}

function mapProgress(row: ProgressRow): LessonProgress {
  return {
    id: row.id,
    userId: row.user_id,
    lessonId: row.lesson_id,
    enrollmentId: row.enrollment_id,
    watchedSeconds: row.watched_seconds,
    completed: row.completed,
    lastWatchedAt: row.last_watched_at,
  };
}

const PROGRESS_COLUMNS = "id, user_id, lesson_id, enrollment_id, watched_seconds, completed, last_watched_at";

export async function getProgressForUser(client: SupabaseClient, userId: string): Promise<LessonProgress[]> {
  const { data, error } = await client.from("progress").select(PROGRESS_COLUMNS).eq("user_id", userId);
  if (error) throw error;
  return (data as ProgressRow[]).map(mapProgress);
}

export async function getProgressForLesson(
  client: SupabaseClient,
  userId: string,
  lessonId: string
): Promise<LessonProgress | undefined> {
  const { data, error } = await client
    .from("progress")
    .select(PROGRESS_COLUMNS)
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProgress(data as ProgressRow) : undefined;
}

export async function getCourseCompletionPercent(
  client: SupabaseClient,
  userId: string,
  courseId: string
): Promise<number> {
  const [lessons, progress, quizzes] = await Promise.all([
    getLessonsForCourse(client, courseId),
    getProgressForUser(client, userId),
    getQuizzesForCourse(client, courseId),
  ]);
  const requiredQuizzes = quizzes.filter((q) => q.isRequired);
  const total = lessons.length + requiredQuizzes.length;
  if (total === 0) return 0;

  const completedLessons = lessons.filter((l) => progress.some((p) => p.lessonId === l.id && p.completed)).length;
  const passedQuizzes = (
    await Promise.all(requiredQuizzes.map((q) => getLatestPassingAttempt(client, userId, q.id)))
  ).filter((attempt) => attempt !== undefined).length;

  return Math.round(((completedLessons + passedQuizzes) / total) * 100);
}

/**
  * Calculates course completion percentages for multiple courses in a single batch.
  * Eliminates running 3-5 roundtrip database queries per course.
  */
export async function getCourseCompletionPercentagesForUser(
  client: SupabaseClient,
  userId: string,
  courseIds: string[]
): Promise<Record<string, number>> {
  if (courseIds.length === 0) return {};

  const [lessonsRes, progressRes, quizzesRes, attemptsRes] = await Promise.all([
    client.from("lessons").select("id, course_id, published").in("course_id", courseIds),
    client.from("progress").select("lesson_id, completed").eq("user_id", userId).eq("completed", true),
    client.from("quizzes").select("id, course_id, is_required").in("course_id", courseIds).eq("is_required", true),
    client.from("quiz_attempts").select("quiz_id").eq("user_id", userId).eq("passed", true),
  ]);

  if (lessonsRes.error) throw lessonsRes.error;
  if (progressRes.error) throw progressRes.error;
  if (quizzesRes.error) throw quizzesRes.error;
  if (attemptsRes.error) throw attemptsRes.error;

  const completedLessonIds = new Set((progressRes.data ?? []).map((p) => p.lesson_id));
  const passedQuizIds = new Set((attemptsRes.data ?? []).map((a) => a.quiz_id));

  const result: Record<string, number> = {};

  for (const courseId of courseIds) {
    const courseLessons = (lessonsRes.data ?? []).filter((l) => l.course_id === courseId && l.published);
    const courseQuizzes = (quizzesRes.data ?? []).filter((q) => q.course_id === courseId);
    const total = courseLessons.length + courseQuizzes.length;
    if (total === 0) {
      result[courseId] = 0;
      continue;
    }

    const completedLessons = courseLessons.filter((l) => completedLessonIds.has(l.id)).length;
    const passedQuizzes = courseQuizzes.filter((q) => passedQuizIds.has(q.id)).length;

    result[courseId] = Math.round(((completedLessons + passedQuizzes) / total) * 100);
  }

  return result;
}

/**
 * Consecutive calendar days (UTC) with at least one progress write, counting
 * backward from today until the first gap. No schema beyond `progress`
 * needed -- just distinct `last_watched_at` dates.
 */
export async function getDayStreak(client: SupabaseClient, userId: string): Promise<number> {
  const { data, error } = await client.from("progress").select("last_watched_at").eq("user_id", userId);
  if (error) throw error;

  const days = new Set(
    (data as { last_watched_at: string }[]).map((r) => new Date(r.last_watched_at).toISOString().slice(0, 10))
  );

  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

/**
 * Upserts a learner's watch position/completion for one lesson, then runs
 * the Phase 0 completion RPCs: touch_enrollment_progress (flips
 * enrolled -> in-progress on first write, no-op otherwise) always, and
 * evaluate_course_completion (checks + issues a certificate if eligible)
 * whenever this write marks the lesson completed.
 */
export async function upsertLessonProgress(
  client: SupabaseClient,
  params: {
    userId: string;
    lessonId: string;
    enrollmentId: string;
    courseId: string;
    watchedSeconds: number;
    completed: boolean;
  }
): Promise<LessonProgress> {
  const { data, error } = await client
    .from("progress")
    .upsert(
      {
        user_id: params.userId,
        lesson_id: params.lessonId,
        enrollment_id: params.enrollmentId,
        watched_seconds: params.watchedSeconds,
        completed: params.completed,
        last_watched_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    )
    .select(PROGRESS_COLUMNS)
    .single();
  if (error) throw error;

  await client.rpc("touch_enrollment_progress", { p_course_id: params.courseId });
  if (params.completed) {
    await client.rpc("evaluate_course_completion", { p_course_id: params.courseId });
  }

  return mapProgress(data as ProgressRow);
}
