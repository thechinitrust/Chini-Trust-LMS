import type { SupabaseClient } from "@supabase/supabase-js";

import type { Certificate } from "@/lib/types";

interface CertificateRow {
  id: string;
  user_id: string;
  course_id: string;
  learner_name: string;
  course_title: string;
  issued_at: string;
  certificate_url: string | null;
}

function mapCertificate(row: CertificateRow): Certificate {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    learnerName: row.learner_name,
    courseTitle: row.course_title,
    issuedAt: row.issued_at,
    certificateUrl: row.certificate_url ?? undefined,
  };
}

const CERTIFICATE_COLUMNS = "id, user_id, course_id, learner_name, course_title, issued_at, certificate_url";

export async function getCertificatesForUser(client: SupabaseClient, userId: string): Promise<Certificate[]> {
  const { data, error } = await client
    .from("certificates")
    .select(CERTIFICATE_COLUMNS)
    .eq("user_id", userId);
  if (error) throw error;
  return (data as CertificateRow[]).map(mapCertificate);
}

export async function getCertificateById(client: SupabaseClient, id: string): Promise<Certificate | undefined> {
  const { data, error } = await client
    .from("certificates")
    .select(CERTIFICATE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCertificate(data as CertificateRow) : undefined;
}

export async function listCertificates(client: SupabaseClient): Promise<Certificate[]> {
  const { data, error } = await client
    .from("certificates")
    .select(CERTIFICATE_COLUMNS)
    .order("issued_at", { ascending: false });
  if (error) throw error;
  return (data as CertificateRow[]).map(mapCertificate);
}

/** Admin manual issuance -- a no-op-safe insert (unique(user_id,course_id)). */
export async function issueCertificateManually(
  client: SupabaseClient,
  input: { userId: string; courseId: string; learnerName: string; courseTitle: string }
): Promise<Certificate> {
  const { data, error } = await client
    .from("certificates")
    .upsert(
      {
        user_id: input.userId,
        course_id: input.courseId,
        learner_name: input.learnerName,
        course_title: input.courseTitle,
      },
      { onConflict: "user_id,course_id" }
    )
    .select(CERTIFICATE_COLUMNS)
    .single();
  if (error) throw error;
  return mapCertificate(data as CertificateRow);
}

export async function revokeCertificate(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("certificates").delete().eq("id", id);
  if (error) throw error;
}

export async function recheckCertificateEligibility(
  client: SupabaseClient,
  userId: string,
  courseId: string
): Promise<void> {
  const { error } = await client.rpc("admin_recheck_course_completion", {
    p_user_id: userId,
    p_course_id: courseId,
  });
  if (error) throw error;
}
