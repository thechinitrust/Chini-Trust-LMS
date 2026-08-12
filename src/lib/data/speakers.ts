import type { SupabaseClient } from "@supabase/supabase-js";

import type { Speaker } from "@/lib/types";

interface SpeakerRow {
  id: string;
  name: string;
  role: string;
  organization: string;
  bio: string;
  photo_url: string;
  created_at: string;
}

function mapSpeaker(row: SpeakerRow): Speaker {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    organization: row.organization,
    bio: row.bio,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
  };
}

const SPEAKER_COLUMNS = "id, name, role, organization, bio, photo_url, created_at";

export async function listSpeakers(client: SupabaseClient): Promise<Speaker[]> {
  const { data, error } = await client
    .from("speakers")
    .select(SPEAKER_COLUMNS)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as SpeakerRow[]).map(mapSpeaker);
}

export async function getSpeakerById(client: SupabaseClient, id: string): Promise<Speaker | undefined> {
  const { data, error } = await client
    .from("speakers")
    .select(SPEAKER_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSpeaker(data as SpeakerRow) : undefined;
}

export interface SpeakerInput {
  name: string;
  role: string;
  organization: string;
  bio: string;
  photoUrl: string;
}

export async function createSpeaker(client: SupabaseClient, input: SpeakerInput): Promise<Speaker> {
  const { data, error } = await client
    .from("speakers")
    .insert({
      name: input.name,
      role: input.role,
      organization: input.organization,
      bio: input.bio,
      photo_url: input.photoUrl,
    })
    .select(SPEAKER_COLUMNS)
    .single();
  if (error) throw error;
  return mapSpeaker(data as SpeakerRow);
}

export async function updateSpeaker(client: SupabaseClient, id: string, input: SpeakerInput): Promise<Speaker> {
  const { data, error } = await client
    .from("speakers")
    .update({
      name: input.name,
      role: input.role,
      organization: input.organization,
      bio: input.bio,
      photo_url: input.photoUrl,
    })
    .eq("id", id)
    .select(SPEAKER_COLUMNS)
    .single();
  if (error) throw error;
  return mapSpeaker(data as SpeakerRow);
}

export async function deleteSpeaker(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("speakers").delete().eq("id", id);
  if (error) throw error;
}

/** All speakers linked to a course, via the course_speakers join table. */
export async function getSpeakersForCourse(client: SupabaseClient, courseId: string): Promise<Speaker[]> {
  const { data, error } = await client
    .from("course_speakers")
    .select(`speaker:speakers(${SPEAKER_COLUMNS})`)
    .eq("course_id", courseId);
  if (error) throw error;
  return (data as unknown as { speaker: SpeakerRow }[])
    .map((row) => row.speaker)
    .filter(Boolean)
    .map(mapSpeaker);
}

/** IDs of every speaker linked to a course -- used to pre-check the admin
 *  multi-select without pulling full speaker rows. */
export async function getSpeakerIdsForCourse(client: SupabaseClient, courseId: string): Promise<string[]> {
  const { data, error } = await client.from("course_speakers").select("speaker_id").eq("course_id", courseId);
  if (error) throw error;
  return (data as { speaker_id: string }[]).map((row) => row.speaker_id);
}

/** Replaces a course's full set of linked speakers with `speakerIds`. */
export async function setCourseSpeakers(
  client: SupabaseClient,
  courseId: string,
  speakerIds: string[]
): Promise<void> {
  const { error: deleteError } = await client.from("course_speakers").delete().eq("course_id", courseId);
  if (deleteError) throw deleteError;

  if (speakerIds.length === 0) return;

  const { error: insertError } = await client
    .from("course_speakers")
    .insert(speakerIds.map((speakerId) => ({ course_id: courseId, speaker_id: speakerId })));
  if (insertError) throw insertError;
}
