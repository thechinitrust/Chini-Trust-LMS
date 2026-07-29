import type { SupabaseClient } from "@supabase/supabase-js";

import type { LmsEvent } from "@/lib/types";

interface EventRow {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  link_url: string | null;
  category: string;
  published: boolean;
}

function mapEvent(row: EventRow): LmsEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startsAt: row.starts_at,
    endsAt: row.ends_at ?? undefined,
    location: row.location ?? undefined,
    linkUrl: row.link_url ?? undefined,
    category: row.category as LmsEvent["category"],
    published: row.published,
  };
}

const EVENT_COLUMNS = "id, title, description, starts_at, ends_at, location, link_url, category, published";

export async function listEvents(client: SupabaseClient): Promise<LmsEvent[]> {
  const { data, error } = await client
    .from("events")
    .select(EVENT_COLUMNS)
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return (data as EventRow[]).map(mapEvent);
}

export async function getUpcomingEvents(client: SupabaseClient, limit = 3): Promise<LmsEvent[]> {
  const { data, error } = await client
    .from("events")
    .select(EVENT_COLUMNS)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data as EventRow[]).map(mapEvent);
}

export interface EventInput {
  title: string;
  description: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  linkUrl?: string;
  category: LmsEvent["category"];
  published: boolean;
}

function toEventRow(input: EventInput) {
  return {
    title: input.title,
    description: input.description,
    starts_at: input.startsAt,
    ends_at: input.endsAt ?? null,
    location: input.location ?? null,
    link_url: input.linkUrl ?? null,
    category: input.category,
    published: input.published,
  };
}

export async function createEvent(client: SupabaseClient, input: EventInput): Promise<LmsEvent> {
  const { data, error } = await client
    .from("events")
    .insert(toEventRow(input))
    .select(EVENT_COLUMNS)
    .single();
  if (error) throw error;
  return mapEvent(data as EventRow);
}

export async function updateEvent(
  client: SupabaseClient,
  id: string,
  input: EventInput
): Promise<LmsEvent> {
  const { data, error } = await client
    .from("events")
    .update(toEventRow(input))
    .eq("id", id)
    .select(EVENT_COLUMNS)
    .single();
  if (error) throw error;
  return mapEvent(data as EventRow);
}

export async function deleteEvent(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("events").delete().eq("id", id);
  if (error) throw error;
}
