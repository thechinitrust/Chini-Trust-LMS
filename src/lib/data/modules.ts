import type { SupabaseClient } from "@supabase/supabase-js";

import type { Module } from "@/lib/types";

interface ModuleRow {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
}

function mapModule(row: ModuleRow): Module {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    order: row.order,
  };
}

const MODULE_COLUMNS = "id, course_id, title, description, order";

export async function getModulesForCourse(client: SupabaseClient, courseId: string): Promise<Module[]> {
  const { data, error } = await client
    .from("modules")
    .select(MODULE_COLUMNS)
    .eq("course_id", courseId)
    .order("order", { ascending: true });
  if (error) throw error;
  return (data as ModuleRow[]).map(mapModule);
}

export async function getModuleById(client: SupabaseClient, id: string): Promise<Module | undefined> {
  const { data, error } = await client.from("modules").select(MODULE_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapModule(data as ModuleRow) : undefined;
}

export interface ModuleInput {
  courseId: string;
  title: string;
  description: string;
  order: number;
}

export async function createModule(client: SupabaseClient, input: ModuleInput): Promise<Module> {
  const { data, error } = await client
    .from("modules")
    .insert({
      course_id: input.courseId,
      title: input.title,
      description: input.description,
      order: input.order,
    })
    .select(MODULE_COLUMNS)
    .single();
  if (error) throw error;
  return mapModule(data as ModuleRow);
}

export async function updateModule(
  client: SupabaseClient,
  id: string,
  input: ModuleInput
): Promise<Module> {
  const { data, error } = await client
    .from("modules")
    .update({
      course_id: input.courseId,
      title: input.title,
      description: input.description,
      order: input.order,
    })
    .eq("id", id)
    .select(MODULE_COLUMNS)
    .single();
  if (error) throw error;
  return mapModule(data as ModuleRow);
}

export async function deleteModule(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("modules").delete().eq("id", id);
  if (error) throw error;
}
