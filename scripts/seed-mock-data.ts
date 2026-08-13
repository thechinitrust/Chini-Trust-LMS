/**
 * One-off seed: migrates the frozen sample content in scripts/seed-data.ts
 * into the real Supabase project, re-pointing the sample learner's history
 * (enrollments/progress/quiz attempt/certificate) onto the real
 * `user@chinilearn.org` account. Useful for populating a fresh/staging
 * Supabase project with realistic demo content.
 *
 * Run with: npm run seed
 * (requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
 * SUPABASE_SERVICE_ROLE_KEY in .env.local -- loaded via `tsx --env-file`)
 *
 * Safe to re-run: every step deletes-by-known-slug/title before inserting.
 */
import { createClient } from "@supabase/supabase-js";
import {
  mockCourses,
  mockModules,
  mockLessons,
  mockResources,
  mockQuizzes,
  mockQuizQuestions,
  mockEnrollments,
  mockLessonProgress,
  mockQuizAttempts,
  mockCertificates,
  CURRENT_LEARNER_ID,
} from "./seed-data";

const LEARNER_EMAIL = "user@chinilearn.org";
const LEARNER_PASSWORD = "ChiniLearn@2026";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !anonKey || !serviceKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY"
  );
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

function must<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) throw new Error(`missing: ${what}`);
  return value;
}

async function insert<T>(table: string, rows: object[]): Promise<T[]> {
  const { data, error } = await admin.from(table).insert(rows).select();
  if (error) throw new Error(`insert into ${table} failed: ${error.message}`);
  return data as T[];
}

async function resolveLearnerId(): Promise<string> {
  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .eq("email", LEARNER_EMAIL)
    .single();
  if (error || !data) {
    throw new Error(
      `Could not find profile for ${LEARNER_EMAIL} -- create the account first.`
    );
  }
  return data.id as string;
}

async function seedCourses() {
  const slugs = mockCourses.map((c) => c.slug);
  await admin.from("courses").delete().in("slug", slugs);

  const rows = mockCourses.map((c) => ({
    slug: c.slug,
    title: c.title,
    summary: c.summary,
    description: c.description,
    category: c.category,
    audience: c.audience,
    thumbnail_url: c.thumbnailUrl,
    estimated_minutes: c.estimatedMinutes,
    level: c.level,
    objectives: c.objectives,
    requires_certificate: c.requiresCertificate,
    published: c.published,
    preview_video_id: c.previewVideoId ?? null,
  }));
  const inserted = await insert<{ id: string; slug: string }>("courses", rows);

  const map = new Map<string, string>(); // mock course.id -> real uuid
  for (const mock of mockCourses) {
    const real = must(
      inserted.find((r) => r.slug === mock.slug),
      `courses row for slug ${mock.slug}`
    );
    map.set(mock.id, real.id);
  }
  return map;
}

async function seedModules(courseIdMap: Map<string, string>) {
  const rows = mockModules.map((m) => ({
    course_id: must(courseIdMap.get(m.courseId), `course for module ${m.id}`),
    title: m.title,
    description: m.description,
    order: m.order,
  }));
  const inserted = await insert<{ id: string; course_id: string; title: string; order: number }>(
    "modules",
    rows
  );

  const map = new Map<string, string>(); // mock module.id -> real uuid
  for (const mock of mockModules) {
    const courseUuid = must(courseIdMap.get(mock.courseId), mock.id);
    const real = must(
      inserted.find(
        (r) => r.course_id === courseUuid && r.title === mock.title && r.order === mock.order
      ),
      `modules row for ${mock.id}`
    );
    map.set(mock.id, real.id);
  }
  return map;
}

async function seedLessons(courseIdMap: Map<string, string>, moduleIdMap: Map<string, string>) {
  const rows = mockLessons.map((l) => ({
    module_id: must(moduleIdMap.get(l.moduleId), `module for lesson ${l.id}`),
    course_id: must(courseIdMap.get(l.courseId), `course for lesson ${l.id}`),
    title: l.title,
    description: l.description,
    notes: l.notes ?? null,
    order: l.order,
    published: l.published,
    youtube_video_id: l.video.youtubeVideoId,
    thumbnail_url: l.video.thumbnailUrl,
    duration_seconds: l.video.durationSeconds,
    objectives: l.objectives ?? [],
  }));
  const inserted = await insert<{ id: string; module_id: string; title: string; order: number }>(
    "lessons",
    rows
  );

  const map = new Map<string, string>(); // mock lesson.id -> real uuid
  for (const mock of mockLessons) {
    const moduleUuid = must(moduleIdMap.get(mock.moduleId), mock.id);
    const real = must(
      inserted.find(
        (r) => r.module_id === moduleUuid && r.title === mock.title && r.order === mock.order
      ),
      `lessons row for ${mock.id}`
    );
    map.set(mock.id, real.id);
  }
  return map;
}

async function seedResources(courseIdMap: Map<string, string>) {
  const titles = mockResources.map((r) => r.title);
  await admin.from("resources").delete().in("title", titles);

  const rows = mockResources.map((r) => ({
    title: r.title,
    summary: r.summary,
    type: r.type,
    audiences: r.audiences,
    file_url: r.fileUrl,
    course_id: r.courseId ? must(courseIdMap.get(r.courseId), `course for resource ${r.id}`) : null,
    featured: r.featured ?? false,
  }));
  await insert("resources", rows);
}

async function seedQuizzes(courseIdMap: Map<string, string>, moduleIdMap: Map<string, string>) {
  const rows = mockQuizzes.map((q) => ({
    module_id: must(moduleIdMap.get(q.moduleId), `module for quiz ${q.id}`),
    course_id: must(courseIdMap.get(q.courseId), `course for quiz ${q.id}`),
    title: q.title,
    description: q.description,
    pass_threshold: q.passThreshold,
    is_required: q.isRequired,
  }));
  const inserted = await insert<{ id: string; module_id: string; title: string }>("quizzes", rows);

  const map = new Map<string, string>(); // mock quiz.id -> real uuid
  for (const mock of mockQuizzes) {
    const moduleUuid = must(moduleIdMap.get(mock.moduleId), mock.id);
    const real = must(
      inserted.find((r) => r.module_id === moduleUuid && r.title === mock.title),
      `quizzes row for ${mock.id}`
    );
    map.set(mock.id, real.id);
  }
  return map;
}

async function seedQuizQuestions(quizIdMap: Map<string, string>) {
  const rows = mockQuizQuestions.map((q) => ({
    quiz_id: must(quizIdMap.get(q.quizId), `quiz for question ${q.id}`),
    question: q.question,
    type: q.type,
    order: q.order,
  }));
  const inserted = await insert<{ id: string; quiz_id: string; question: string; order: number }>(
    "quiz_questions",
    rows
  );

  const map = new Map<string, string>(); // mock question.id -> real uuid
  for (const mock of mockQuizQuestions) {
    const quizUuid = must(quizIdMap.get(mock.quizId), mock.id);
    const real = must(
      inserted.find(
        (r) => r.quiz_id === quizUuid && r.question === mock.question && r.order === mock.order
      ),
      `quiz_questions row for ${mock.id}`
    );
    map.set(mock.id, real.id);
  }
  return map;
}

async function seedQuizOptions(questionIdMap: Map<string, string>) {
  // key: `${mockQuestionId}::${mockOptionLetter}` -> real option uuid
  const optionKeyMap = new Map<string, string>();

  for (const question of mockQuizQuestions) {
    const questionUuid = must(questionIdMap.get(question.id), question.id);
    const rows = question.options.map((o) => ({
      question_id: questionUuid,
      text: o.text,
      is_correct: o.isCorrect,
    }));
    const inserted = await insert<{ id: string; question_id: string; text: string }>(
      "quiz_options",
      rows
    );
    for (const mockOption of question.options) {
      const real = must(
        inserted.find((r) => r.text === mockOption.text),
        `quiz_options row for ${question.id}/${mockOption.id}`
      );
      optionKeyMap.set(`${question.id}::${mockOption.id}`, real.id);
    }
  }
  return optionKeyMap;
}

async function seedEnrollments(learnerId: string, courseIdMap: Map<string, string>) {
  const rows = mockEnrollments
    .filter((e) => e.userId === CURRENT_LEARNER_ID)
    .map((e) => ({
      user_id: learnerId,
      course_id: must(courseIdMap.get(e.courseId), `course for enrollment ${e.id}`),
      status: e.status,
      enrolled_at: e.enrolledAt,
      completed_at: e.completedAt ?? null,
    }));
  const inserted = await insert<{ id: string; course_id: string }>("enrollments", rows);

  const map = new Map<string, string>(); // mock enrollment.id -> real uuid
  for (const mock of mockEnrollments.filter((e) => e.userId === CURRENT_LEARNER_ID)) {
    const courseUuid = must(courseIdMap.get(mock.courseId), mock.id);
    const real = must(
      inserted.find((r) => r.course_id === courseUuid),
      `enrollments row for ${mock.id}`
    );
    map.set(mock.id, real.id);
  }
  return map;
}

async function seedProgress(
  learnerId: string,
  lessonIdMap: Map<string, string>,
  enrollmentIdMap: Map<string, string>
) {
  const rows = mockLessonProgress
    .filter((p) => p.userId === CURRENT_LEARNER_ID)
    .map((p) => ({
      user_id: learnerId,
      lesson_id: must(lessonIdMap.get(p.lessonId), `lesson for progress ${p.id}`),
      enrollment_id: must(enrollmentIdMap.get(p.enrollmentId), `enrollment for progress ${p.id}`),
      watched_seconds: p.watchedSeconds,
      completed: p.completed,
      last_watched_at: p.lastWatchedAt,
    }));
  await insert("progress", rows);
}

async function seedQuizAttempt(
  learnerId: string,
  quizIdMap: Map<string, string>,
  questionIdMap: Map<string, string>,
  optionKeyMap: Map<string, string>
) {
  for (const attempt of mockQuizAttempts.filter((a) => a.userId === CURRENT_LEARNER_ID)) {
    const answers: Record<string, string[]> = {};
    for (const [mockQuestionId, mockOptionLetters] of Object.entries(attempt.answers)) {
      const questionUuid = must(questionIdMap.get(mockQuestionId), mockQuestionId);
      answers[questionUuid] = mockOptionLetters.map((letter) =>
        must(optionKeyMap.get(`${mockQuestionId}::${letter}`), `${mockQuestionId}::${letter}`)
      );
    }
    await insert("quiz_attempts", [
      {
        user_id: learnerId,
        quiz_id: must(quizIdMap.get(attempt.quizId), attempt.quizId),
        score: attempt.score,
        passed: attempt.passed,
        answers,
        attempted_at: attempt.attemptedAt,
      },
    ]);
  }
}

async function issueCertificateViaRpc(courseIdMap: Map<string, string>) {
  // Calls the real evaluate_course_completion RPC as the learner (not the
  // service role -- auth.uid() would be null for a service-role session),
  // both to issue the certificate for real and as a smoke test of Phase 0.
  const learnerClient = createClient(url, anonKey);
  const { error: signInError } = await learnerClient.auth.signInWithPassword({
    email: LEARNER_EMAIL,
    password: LEARNER_PASSWORD,
  });
  if (signInError) throw new Error(`could not sign in as ${LEARNER_EMAIL}: ${signInError.message}`);

  for (const cert of mockCertificates.filter((c) => c.userId === CURRENT_LEARNER_ID)) {
    const courseUuid = must(courseIdMap.get(cert.courseId), cert.id);
    const { error } = await learnerClient.rpc("evaluate_course_completion", {
      p_course_id: courseUuid,
    });
    if (error) throw new Error(`evaluate_course_completion failed for ${cert.id}: ${error.message}`);
  }
}

async function seedSampleEvents() {
  const titles = [
    "Autism Foundations Live Q&A",
    "Workplace Inclusion Webinar",
    "ADHD Explained: Assignment Deadline",
  ];
  await admin.from("events").delete().in("title", titles);

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  await insert("events", [
    {
      title: titles[0],
      description: "Live Q&A with Dr. Amara Osei covering the Autism Foundations course.",
      starts_at: new Date(now + 7 * day).toISOString(),
      category: "live-qa",
      published: true,
    },
    {
      title: titles[1],
      description: "A live walkthrough of neuroinclusive hiring practices for managers.",
      starts_at: new Date(now + 14 * day).toISOString(),
      link_url: "https://example.com/webinar",
      category: "webinar",
      published: true,
    },
    {
      title: titles[2],
      description: "Last day to submit the ADHD Explained module quiz for this cohort.",
      starts_at: new Date(now + 3 * day).toISOString(),
      category: "deadline",
      published: true,
    },
  ]);
}

async function main() {
  console.log("Resolving learner id...");
  const learnerId = await resolveLearnerId();
  console.log(`  ${LEARNER_EMAIL} -> ${learnerId}`);

  console.log("Seeding courses...");
  const courseIdMap = await seedCourses();
  console.log(`  ${courseIdMap.size} courses`);

  console.log("Seeding modules...");
  const moduleIdMap = await seedModules(courseIdMap);
  console.log(`  ${moduleIdMap.size} modules`);

  console.log("Seeding lessons...");
  const lessonIdMap = await seedLessons(courseIdMap, moduleIdMap);
  console.log(`  ${lessonIdMap.size} lessons`);

  console.log("Seeding resources...");
  await seedResources(courseIdMap);
  console.log(`  ${mockResources.length} resources`);

  console.log("Seeding quizzes...");
  const quizIdMap = await seedQuizzes(courseIdMap, moduleIdMap);
  console.log(`  ${quizIdMap.size} quizzes`);

  console.log("Seeding quiz questions...");
  const questionIdMap = await seedQuizQuestions(quizIdMap);
  console.log(`  ${questionIdMap.size} questions`);

  console.log("Seeding quiz options...");
  const optionKeyMap = await seedQuizOptions(questionIdMap);
  console.log(`  ${optionKeyMap.size} options`);

  console.log("Seeding enrollments...");
  const enrollmentIdMap = await seedEnrollments(learnerId, courseIdMap);
  console.log(`  ${enrollmentIdMap.size} enrollments`);

  console.log("Seeding progress...");
  await seedProgress(learnerId, lessonIdMap, enrollmentIdMap);
  console.log(`  ${mockLessonProgress.filter((p) => p.userId === CURRENT_LEARNER_ID).length} progress rows`);

  console.log("Seeding quiz attempt...");
  await seedQuizAttempt(learnerId, quizIdMap, questionIdMap, optionKeyMap);
  console.log(`  ${mockQuizAttempts.filter((a) => a.userId === CURRENT_LEARNER_ID).length} attempts`);

  console.log("Issuing certificate via evaluate_course_completion RPC...");
  await issueCertificateViaRpc(courseIdMap);

  console.log("Seeding sample events...");
  await seedSampleEvents();

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
