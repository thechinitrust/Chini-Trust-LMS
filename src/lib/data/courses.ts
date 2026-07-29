import type { SupabaseClient } from "@supabase/supabase-js";

import type { Course } from "@/lib/types";

interface CourseRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  summary: string;
  category: string;
  audience: string[];
  thumbnail_url: string;
  estimated_minutes: number;
  level: string;
  objectives: string[];
  requires_certificate: boolean;
  published: boolean;
  preview_video_id: string | null;
  created_at: string;
}

function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    summary: row.summary,
    category: row.category as Course["category"],
    audience: row.audience as Course["audience"],
    thumbnailUrl: row.thumbnail_url,
    estimatedMinutes: row.estimated_minutes,
    level: row.level as Course["level"],
    objectives: row.objectives,
    requiresCertificate: row.requires_certificate,
    published: row.published,
    createdAt: row.created_at,
    previewVideoId: row.preview_video_id ?? undefined,
  };
}

const COURSE_COLUMNS =
  "id, slug, title, description, summary, category, audience, thumbnail_url, estimated_minutes, level, objectives, requires_certificate, published, preview_video_id, created_at";

/**
 * Every course visible to the caller -- RLS decides *which* rows come back
 * (admins see everything, everyone else only published courses), so this
 * one query serves both the public catalogue and the admin list.
 */
export async function listCourses(client: SupabaseClient): Promise<Course[]> {
  const { data, error } = await client
    .from("courses")
    .select(COURSE_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as CourseRow[]).map(mapCourse);
}

export async function getCourseBySlug(client: SupabaseClient, slug: string): Promise<Course | undefined> {
  const { data, error } = await client
    .from("courses")
    .select(COURSE_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCourse(data as CourseRow) : undefined;
}

export async function getCourseById(client: SupabaseClient, id: string): Promise<Course | undefined> {
  const { data, error } = await client
    .from("courses")
    .select(COURSE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCourse(data as CourseRow) : undefined;
}

export interface CourseInput {
  slug: string;
  title: string;
  description: string;
  summary: string;
  category: Course["category"];
  audience: Course["audience"];
  thumbnailUrl: string;
  estimatedMinutes: number;
  level: Course["level"];
  objectives: string[];
  requiresCertificate: boolean;
  published: boolean;
  previewVideoId?: string;
}

export async function createCourse(client: SupabaseClient, input: CourseInput): Promise<Course> {
  const { data, error } = await client
    .from("courses")
    .insert({
      slug: input.slug,
      title: input.title,
      description: input.description,
      summary: input.summary,
      category: input.category,
      audience: input.audience,
      thumbnail_url: input.thumbnailUrl,
      estimated_minutes: input.estimatedMinutes,
      level: input.level,
      objectives: input.objectives,
      requires_certificate: input.requiresCertificate,
      published: input.published,
      preview_video_id: input.previewVideoId ?? null,
    })
    .select(COURSE_COLUMNS)
    .single();
  if (error) throw error;
  return mapCourse(data as CourseRow);
}

export async function updateCourse(
  client: SupabaseClient,
  id: string,
  input: CourseInput
): Promise<Course> {
  const { data, error } = await client
    .from("courses")
    .update({
      slug: input.slug,
      title: input.title,
      description: input.description,
      summary: input.summary,
      category: input.category,
      audience: input.audience,
      thumbnail_url: input.thumbnailUrl,
      estimated_minutes: input.estimatedMinutes,
      level: input.level,
      objectives: input.objectives,
      requires_certificate: input.requiresCertificate,
      published: input.published,
      preview_video_id: input.previewVideoId ?? null,
    })
    .eq("id", id)
    .select(COURSE_COLUMNS)
    .single();
  if (error) throw error;
  return mapCourse(data as CourseRow);
}

export async function setCoursePublished(
  client: SupabaseClient,
  id: string,
  published: boolean
): Promise<void> {
  const { error } = await client.from("courses").update({ published }).eq("id", id);
  if (error) throw error;
}

export async function deleteCourse(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("courses").delete().eq("id", id);
  if (error) throw error;
}
