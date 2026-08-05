import type { SupabaseClient } from "@supabase/supabase-js";

import type { Profile } from "@/lib/types";

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
}

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role as Profile["role"],
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: row.created_at,
  };
}

const PROFILE_COLUMNS = "id, full_name, email, role, avatar_url, created_at";

export async function listProfiles(client: SupabaseClient): Promise<Profile[]> {
  const { data, error } = await client
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ProfileRow[]).map(mapProfile);
}

export async function getProfileById(client: SupabaseClient, id: string): Promise<Profile | undefined> {
  const { data, error } = await client
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data as ProfileRow) : undefined;
}

export async function getProfileByEmail(client: SupabaseClient, email: string): Promise<Profile | undefined> {
  const { data, error } = await client
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data as ProfileRow) : undefined;
}

/**
 * Promote/demote a user. Relies on the caller's own session already being an
 * admin -- the `guard_profile_role_change` trigger enforces that
 * server-side regardless of what this function sends, so no service-role
 * key is needed here (unlike inviting a brand new user).
 */
export async function updateProfileRole(
  client: SupabaseClient,
  id: string,
  role: Profile["role"]
): Promise<void> {
  const { error } = await client.from("profiles").update({ role }).eq("id", id);
  if (error) throw error;
}
