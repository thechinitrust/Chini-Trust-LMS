import type { SupabaseClient } from "@supabase/supabase-js";

import { categoryLabel } from "@/lib/categories";

const MONTH_LABEL = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Last `months` calendar months (oldest first), ending with the current month. */
function recentMonthKeys(months: number): { key: string; label: string }[] {
  const now = new Date();
  const out: { key: string; label: string }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    out.push({ key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`, label: MONTH_LABEL[d.getUTCMonth()] });
  }
  return out;
}

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
}

export interface OverviewStats {
  totalLearners: number;
  activeUsers30d: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  completionRate: number;
  totalQuizAttempts: number;
  certificatesIssued: number;
}

export async function getOverviewStats(client: SupabaseClient): Promise<OverviewStats> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalLearners },
    { data: activeRows },
    { count: totalCourses },
    { count: publishedCourses },
    { count: totalEnrollments },
    { count: completedEnrollments },
    { count: totalQuizAttempts },
    { count: certificatesIssued },
  ] = await Promise.all([
    client.from("profiles").select("*", { count: "exact", head: true }).eq("role", "learner"),
    client.from("progress").select("user_id").gte("last_watched_at", thirtyDaysAgo),
    client.from("courses").select("*", { count: "exact", head: true }),
    client.from("courses").select("*", { count: "exact", head: true }).eq("published", true),
    client.from("enrollments").select("*", { count: "exact", head: true }),
    client.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "completed"),
    client.from("quiz_attempts").select("*", { count: "exact", head: true }),
    client.from("certificates").select("*", { count: "exact", head: true }),
  ]);

  const activeUsers30d = new Set((activeRows ?? []).map((r: { user_id: string }) => r.user_id)).size;
  const total = totalEnrollments ?? 0;
  const completed = completedEnrollments ?? 0;

  return {
    totalLearners: totalLearners ?? 0,
    activeUsers30d,
    totalCourses: totalCourses ?? 0,
    publishedCourses: publishedCourses ?? 0,
    draftCourses: (totalCourses ?? 0) - (publishedCourses ?? 0),
    totalEnrollments: total,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    totalQuizAttempts: totalQuizAttempts ?? 0,
    certificatesIssued: certificatesIssued ?? 0,
  };
}

export async function getRegistrationsOverTime(
  client: SupabaseClient,
  months = 7
): Promise<{ name: string; users: number }[]> {
  const { data, error } = await client.from("profiles").select("created_at");
  if (error) throw error;
  const buckets = recentMonthKeys(months);
  const counts = new Map(buckets.map((b) => [b.key, 0]));
  for (const row of data as { created_at: string }[]) {
    const key = monthKey(row.created_at);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return buckets.map((b) => ({ name: b.label, users: counts.get(b.key) ?? 0 }));
}

export async function getEnrollmentsOverTime(
  client: SupabaseClient,
  months = 7
): Promise<{ name: string; enrollments: number }[]> {
  const { data, error } = await client.from("enrollments").select("enrolled_at");
  if (error) throw error;
  const buckets = recentMonthKeys(months);
  const counts = new Map(buckets.map((b) => [b.key, 0]));
  for (const row of data as { enrolled_at: string }[]) {
    const key = monthKey(row.enrolled_at);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return buckets.map((b) => ({ name: b.label, enrollments: counts.get(b.key) ?? 0 }));
}

export async function getMostEnrolledCourses(
  client: SupabaseClient,
  limit = 4
): Promise<{ name: string; enrollments: number }[]> {
  const [{ data: enrollments, error: enrollError }, { data: courses, error: courseError }] = await Promise.all([
    client.from("enrollments").select("course_id"),
    client.from("courses").select("id, title"),
  ]);
  if (enrollError) throw enrollError;
  if (courseError) throw courseError;

  const counts = new Map<string, number>();
  for (const row of enrollments as { course_id: string }[]) {
    counts.set(row.course_id, (counts.get(row.course_id) ?? 0) + 1);
  }
  const titleById = new Map((courses as { id: string; title: string }[]).map((c) => [c.id, c.title]));

  return Array.from(counts.entries())
    .map(([courseId, enrollments]) => ({ name: titleById.get(courseId) ?? "Untitled", enrollments }))
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, limit);
}

const AUDIENCE_LABEL: Record<string, string> = {
  students: "Students",
  parents: "Parents",
  teachers: "Teachers",
  employers: "Employers",
  "neurodivergent-individuals": "Neurodivergent individuals",
};

export async function getAudienceDistribution(client: SupabaseClient): Promise<{ name: string; value: number }[]> {
  const [{ data: enrollments, error: enrollError }, { data: courses, error: courseError }] = await Promise.all([
    client.from("enrollments").select("course_id"),
    client.from("courses").select("id, audience"),
  ]);
  if (enrollError) throw enrollError;
  if (courseError) throw courseError;

  const audienceByCourse = new Map(
    (courses as { id: string; audience: string[] }[]).map((c) => [c.id, c.audience])
  );
  const counts = new Map<string, number>();
  for (const row of enrollments as { course_id: string }[]) {
    for (const tag of audienceByCourse.get(row.course_id) ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, value]) => ({ name: AUDIENCE_LABEL[tag] ?? tag, value }))
    .sort((a, b) => b.value - a.value);
}

export async function getCompletionRatesByCategory(
  client: SupabaseClient
): Promise<{ name: string; rate: number }[]> {
  const [{ data: courses, error: courseError }, { data: enrollments, error: enrollError }] = await Promise.all([
    client.from("courses").select("id, category"),
    client.from("enrollments").select("course_id, status"),
  ]);
  if (courseError) throw courseError;
  if (enrollError) throw enrollError;

  const categoryByCourse = new Map((courses as { id: string; category: string }[]).map((c) => [c.id, c.category]));
  const totals = new Map<string, { total: number; completed: number }>();
  for (const row of enrollments as { course_id: string; status: string }[]) {
    const category = categoryByCourse.get(row.course_id);
    if (!category) continue;
    const bucket = totals.get(category) ?? { total: 0, completed: 0 };
    bucket.total += 1;
    if (row.status === "completed") bucket.completed += 1;
    totals.set(category, bucket);
  }

  return Array.from(totals.entries()).map(([category, { total, completed }]) => ({
    name: categoryLabel(category),
    rate: total === 0 ? 0 : Math.round((completed / total) * 100),
  }));
}

export async function getQuizPassFailDistribution(
  client: SupabaseClient
): Promise<{ name: string; value: number }[]> {
  const { data, error } = await client
    .from("quiz_attempts")
    .select("user_id, quiz_id, passed, attempted_at")
    .order("attempted_at", { ascending: true });
  if (error) throw error;

  const byPair = new Map<string, { passed: boolean; attempted_at: string }[]>();
  for (const row of data as { user_id: string; quiz_id: string; passed: boolean; attempted_at: string }[]) {
    const key = `${row.user_id}::${row.quiz_id}`;
    const list = byPair.get(key) ?? [];
    list.push({ passed: row.passed, attempted_at: row.attempted_at });
    byPair.set(key, list);
  }

  let passedFirstTry = 0;
  let passedRetake = 0;
  let failed = 0;
  for (const attempts of byPair.values()) {
    if (attempts[0].passed) {
      passedFirstTry += 1;
    } else if (attempts.some((a) => a.passed)) {
      passedRetake += 1;
    } else {
      failed += 1;
    }
  }

  return [
    { name: "Passed First Try", value: passedFirstTry },
    { name: "Passed Retake", value: passedRetake },
    { name: "Failed", value: failed },
  ].filter((row) => row.value > 0);
}
