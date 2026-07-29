import type { SupabaseClient } from "@supabase/supabase-js";

import type { Enrollment } from "@/lib/types";

interface EnrollmentRow {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
}

function mapEnrollment(row: EnrollmentRow): Enrollment {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    status: row.status as Enrollment["status"],
    enrolledAt: row.enrolled_at,
    completedAt: row.completed_at ?? undefined,
  };
}

const ENROLLMENT_COLUMNS = "id, user_id, course_id, status, enrolled_at, completed_at";

export async function getEnrollmentsForUser(client: SupabaseClient, userId: string): Promise<Enrollment[]> {
  const { data, error } = await client
    .from("enrollments")
    .select(ENROLLMENT_COLUMNS)
    .eq("user_id", userId);
  if (error) throw error;
  return (data as EnrollmentRow[]).map(mapEnrollment);
}

export async function getEnrollment(
  client: SupabaseClient,
  userId: string,
  courseId: string
): Promise<Enrollment | undefined> {
  const { data, error } = await client
    .from("enrollments")
    .select(ENROLLMENT_COLUMNS)
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapEnrollment(data as EnrollmentRow) : undefined;
}

/** Enrolls a learner in a course; a no-op if they're already enrolled. */
export async function enrollInCourse(
  client: SupabaseClient,
  userId: string,
  courseId: string
): Promise<Enrollment> {
  const existing = await getEnrollment(client, userId, courseId);
  if (existing) return existing;

  const { data, error } = await client
    .from("enrollments")
    .insert({ user_id: userId, course_id: courseId })
    .select(ENROLLMENT_COLUMNS)
    .single();
  if (error) throw error;
  return mapEnrollment(data as EnrollmentRow);
}

export async function listEnrollments(client: SupabaseClient): Promise<Enrollment[]> {
  const { data, error } = await client.from("enrollments").select(ENROLLMENT_COLUMNS);
  if (error) throw error;
  return (data as EnrollmentRow[]).map(mapEnrollment);
}
