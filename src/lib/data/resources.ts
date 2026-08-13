import type { SupabaseClient } from "@supabase/supabase-js";

import type { Resource } from "@/lib/types";

interface ResourceRow {
  id: string;
  title: string;
  summary: string;
  type: string;
  audiences: string[] | null;
  file_url: string;
  course_id: string | null;
  module_id: string | null;
  lesson_id: string | null;
  featured: boolean;
  created_at: string;
}

function mapResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    type: row.type as Resource["type"],
    audiences: row.audiences ?? [],
    fileUrl: row.file_url,
    courseId: row.course_id ?? undefined,
    moduleId: row.module_id ?? undefined,
    lessonId: row.lesson_id ?? undefined,
    featured: row.featured,
    createdAt: row.created_at,
  };
}

const RESOURCE_COLUMNS =
  "id, title, summary, type, audiences, file_url, course_id, module_id, lesson_id, featured, created_at";

export async function listResources(client: SupabaseClient): Promise<Resource[]> {
  const { data, error } = await client
    .from("resources")
    .select(RESOURCE_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ResourceRow[]).map(mapResource);
}

export async function getResourcesForCourse(client: SupabaseClient, courseId: string): Promise<Resource[]> {
  const { data, error } = await client
    .from("resources")
    .select(RESOURCE_COLUMNS)
    .eq("course_id", courseId);
  if (error) throw error;
  return (data as ResourceRow[]).map(mapResource);
}

/** Resources attached directly to this module, or to any lesson within it. */
export async function getResourcesForModule(
  client: SupabaseClient,
  moduleId: string,
  lessonIds: string[]
): Promise<Resource[]> {
  const orFilter =
    lessonIds.length > 0
      ? `module_id.eq.${moduleId},lesson_id.in.(${lessonIds.join(",")})`
      : `module_id.eq.${moduleId}`;
  const { data, error } = await client.from("resources").select(RESOURCE_COLUMNS).or(orFilter);
  if (error) throw error;
  return (data as ResourceRow[]).map(mapResource);
}

export async function getResourcesForLesson(client: SupabaseClient, lessonId: string): Promise<Resource[]> {
  const { data, error } = await client
    .from("resources")
    .select(RESOURCE_COLUMNS)
    .eq("lesson_id", lessonId);
  if (error) throw error;
  return (data as ResourceRow[]).map(mapResource);
}

export interface ResourceInput {
  title: string;
  summary: string;
  type: Resource["type"];
  audiences: Resource["audiences"];
  fileUrl: string;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  featured: boolean;
}

function toResourceRow(input: ResourceInput) {
  return {
    title: input.title,
    summary: input.summary,
    type: input.type,
    audiences: input.audiences,
    file_url: input.fileUrl,
    course_id: input.courseId ?? null,
    module_id: input.moduleId ?? null,
    lesson_id: input.lessonId ?? null,
    featured: input.featured,
  };
}

export async function createResource(client: SupabaseClient, input: ResourceInput): Promise<Resource> {
  const { data, error } = await client
    .from("resources")
    .insert(toResourceRow(input))
    .select(RESOURCE_COLUMNS)
    .single();
  if (error) throw error;
  return mapResource(data as ResourceRow);
}

export async function updateResource(
  client: SupabaseClient,
  id: string,
  input: ResourceInput
): Promise<Resource> {
  const { data, error } = await client
    .from("resources")
    .update(toResourceRow(input))
    .eq("id", id)
    .select(RESOURCE_COLUMNS)
    .single();
  if (error) throw error;
  return mapResource(data as ResourceRow);
}

export async function deleteResource(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("resources").delete().eq("id", id);
  if (error) throw error;
}
