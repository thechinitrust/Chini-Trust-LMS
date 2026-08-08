import type { SupabaseClient } from "@supabase/supabase-js";

import type { Lesson } from "@/lib/types";

interface LessonRow {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  description: string;
  notes: string | null;
  order: number;
  published: boolean;
  youtube_video_id: string;
  thumbnail_url: string;
  duration_seconds: number;
  objectives: string[];
}

function mapLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    moduleId: row.module_id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    notes: row.notes ?? undefined,
    order: row.order,
    published: row.published,
    video: {
      youtubeVideoId: row.youtube_video_id,
      thumbnailUrl: row.thumbnail_url,
      durationSeconds: row.duration_seconds,
    },
    objectives: row.objectives,
  };
}

const LESSON_COLUMNS =
  "id, module_id, course_id, title, description, notes, order, published, youtube_video_id, thumbnail_url, duration_seconds, objectives";

export async function getLessonsForModule(client: SupabaseClient, moduleId: string): Promise<Lesson[]> {
  const { data, error } = await client
    .from("lessons")
    .select(LESSON_COLUMNS)
    .eq("module_id", moduleId)
    .order("order", { ascending: true });
  if (error) throw error;
  return (data as LessonRow[]).map(mapLesson);
}

/** Sorted by module order, then lesson order within the module. */
export async function getLessonsForCourse(client: SupabaseClient, courseId: string): Promise<Lesson[]> {
  const [{ data: lessonRows, error: lessonsError }, { data: moduleRows, error: modulesError }] =
    await Promise.all([
      client.from("lessons").select(LESSON_COLUMNS).eq("course_id", courseId),
      client.from("modules").select("id, order").eq("course_id", courseId),
    ]);
  if (lessonsError) throw lessonsError;
  if (modulesError) throw modulesError;

  const moduleOrder = new Map((moduleRows as { id: string; order: number }[]).map((m) => [m.id, m.order]));
  return (lessonRows as LessonRow[])
    .map(mapLesson)
    .sort((a, b) => {
      const ma = moduleOrder.get(a.moduleId) ?? 0;
      const mb = moduleOrder.get(b.moduleId) ?? 0;
      return ma - mb || a.order - b.order;
    });
}

export async function getLessonById(client: SupabaseClient, id: string): Promise<Lesson | undefined> {
  const { data, error } = await client.from("lessons").select(LESSON_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapLesson(data as LessonRow) : undefined;
}

export async function getNextLesson(client: SupabaseClient, lessonId: string): Promise<Lesson | undefined> {
  const current = await getLessonById(client, lessonId);
  if (!current) return undefined;
  const courseLessons = await getLessonsForCourse(client, current.courseId);
  const idx = courseLessons.findIndex((l) => l.id === lessonId);
  return courseLessons[idx + 1];
}

export async function getPreviousLesson(
  client: SupabaseClient,
  lessonId: string
): Promise<Lesson | undefined> {
  const current = await getLessonById(client, lessonId);
  if (!current) return undefined;
  const courseLessons = await getLessonsForCourse(client, current.courseId);
  const idx = courseLessons.findIndex((l) => l.id === lessonId);
  return idx > 0 ? courseLessons[idx - 1] : undefined;
}

export interface LessonInput {
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  notes?: string;
  order: number;
  published: boolean;
  youtubeVideoId: string;
  thumbnailUrl: string;
  durationSeconds: number;
  objectives: string[];
}

function toLessonRow(input: LessonInput) {
  return {
    module_id: input.moduleId,
    course_id: input.courseId,
    title: input.title,
    description: input.description,
    notes: input.notes ?? null,
    order: input.order,
    published: input.published,
    youtube_video_id: input.youtubeVideoId,
    thumbnail_url: input.thumbnailUrl,
    duration_seconds: input.durationSeconds,
    objectives: input.objectives,
  };
}

export async function createLesson(client: SupabaseClient, input: LessonInput): Promise<Lesson> {
  const { data, error } = await client
    .from("lessons")
    .insert(toLessonRow(input))
    .select(LESSON_COLUMNS)
    .single();
  if (error) throw error;
  return mapLesson(data as LessonRow);
}

export async function updateLesson(
  client: SupabaseClient,
  id: string,
  input: LessonInput
): Promise<Lesson> {
  const { data, error } = await client
    .from("lessons")
    .update(toLessonRow(input))
    .eq("id", id)
    .select(LESSON_COLUMNS)
    .single();
  if (error) throw error;
  return mapLesson(data as LessonRow);
}

export async function deleteLesson(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("lessons").delete().eq("id", id);
  if (error) throw error;
}

/** Persists a new top-to-bottom order for a module's lessons after a drag-reorder. */
export async function reorderLessons(
  client: SupabaseClient,
  orderedIds: string[]
): Promise<void> {
  const results = await Promise.all(
    orderedIds.map((id, index) => client.from("lessons").update({ order: index + 1 }).eq("id", id))
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}
