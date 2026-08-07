import type { SupabaseClient } from "@supabase/supabase-js";

import type { Quiz, QuizAttempt, QuizQuestion } from "@/lib/types";

interface QuizRow {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  description: string;
  pass_threshold: number;
  is_required: boolean;
}

function mapQuiz(row: QuizRow): Quiz {
  return {
    id: row.id,
    moduleId: row.module_id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    passThreshold: row.pass_threshold,
    isRequired: row.is_required,
  };
}

const QUIZ_COLUMNS = "id, module_id, course_id, title, description, pass_threshold, is_required";

export async function listQuizzes(client: SupabaseClient): Promise<Quiz[]> {
  const { data, error } = await client.from("quizzes").select(QUIZ_COLUMNS);
  if (error) throw error;
  return (data as QuizRow[]).map(mapQuiz);
}

export async function getQuizById(client: SupabaseClient, id: string): Promise<Quiz | undefined> {
  const { data, error } = await client.from("quizzes").select(QUIZ_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapQuiz(data as QuizRow) : undefined;
}

export async function getQuizForModule(client: SupabaseClient, moduleId: string): Promise<Quiz | undefined> {
  const { data, error } = await client
    .from("quizzes")
    .select(QUIZ_COLUMNS)
    .eq("module_id", moduleId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapQuiz(data as QuizRow) : undefined;
}

export async function getQuizzesForCourse(client: SupabaseClient, courseId: string): Promise<Quiz[]> {
  const { data, error } = await client.from("quizzes").select(QUIZ_COLUMNS).eq("course_id", courseId);
  if (error) throw error;
  return (data as QuizRow[]).map(mapQuiz);
}

export interface QuizInput {
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  passThreshold: number;
  isRequired: boolean;
}

export async function createQuiz(client: SupabaseClient, input: QuizInput): Promise<Quiz> {
  const { data, error } = await client
    .from("quizzes")
    .insert({
      module_id: input.moduleId,
      course_id: input.courseId,
      title: input.title,
      description: input.description,
      pass_threshold: input.passThreshold,
      is_required: input.isRequired,
    })
    .select(QUIZ_COLUMNS)
    .single();
  if (error) throw error;
  return mapQuiz(data as QuizRow);
}

export async function updateQuiz(client: SupabaseClient, id: string, input: QuizInput): Promise<Quiz> {
  const { data, error } = await client
    .from("quizzes")
    .update({
      module_id: input.moduleId,
      course_id: input.courseId,
      title: input.title,
      description: input.description,
      pass_threshold: input.passThreshold,
      is_required: input.isRequired,
    })
    .eq("id", id)
    .select(QUIZ_COLUMNS)
    .single();
  if (error) throw error;
  return mapQuiz(data as QuizRow);
}

export async function deleteQuiz(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("quizzes").delete().eq("id", id);
  if (error) throw error;
}

// --- Admin question/option authoring (admin RLS reads/writes these tables
// directly -- no RPC needed, unlike the learner-facing flow below) ---

interface QuestionRow {
  id: string;
  quiz_id: string;
  question: string;
  type: string;
  order: number;
}

interface OptionRow {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
}

export async function getQuestionsForQuiz(
  client: SupabaseClient,
  quizId: string
): Promise<QuizQuestion[]> {
  const { data: questionRows, error: questionsError } = await client
    .from("quiz_questions")
    .select("id, quiz_id, question, type, order")
    .eq("quiz_id", quizId)
    .order("order", { ascending: true });
  if (questionsError) throw questionsError;

  const questionIds = (questionRows as QuestionRow[]).map((q) => q.id);
  const { data: optionRows, error: optionsError } =
    questionIds.length > 0
      ? await client.from("quiz_options").select("id, question_id, text, is_correct").in("question_id", questionIds)
      : { data: [] as OptionRow[], error: null };
  if (optionsError) throw optionsError;

  return (questionRows as QuestionRow[]).map((q) => ({
    id: q.id,
    quizId: q.quiz_id,
    question: q.question,
    type: q.type as QuizQuestion["type"],
    order: q.order,
    options: (optionRows as OptionRow[])
      .filter((o) => o.question_id === q.id)
      .map((o) => ({ id: o.id, text: o.text, isCorrect: o.is_correct })),
  }));
}

export interface QuestionInput {
  quizId: string;
  question: string;
  type: QuizQuestion["type"];
  order: number;
}

export async function createQuizQuestion(
  client: SupabaseClient,
  input: QuestionInput
): Promise<QuizQuestion> {
  const { data, error } = await client
    .from("quiz_questions")
    .insert({ quiz_id: input.quizId, question: input.question, type: input.type, order: input.order })
    .select("id, quiz_id, question, type, order")
    .single();
  if (error) throw error;
  const row = data as QuestionRow;
  return { id: row.id, quizId: row.quiz_id, question: row.question, type: row.type as QuizQuestion["type"], order: row.order, options: [] };
}

export async function updateQuizQuestion(
  client: SupabaseClient,
  id: string,
  input: Omit<QuestionInput, "quizId">
): Promise<void> {
  const { error } = await client
    .from("quiz_questions")
    .update({ question: input.question, type: input.type, order: input.order })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteQuizQuestion(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("quiz_questions").delete().eq("id", id);
  if (error) throw error;
}

export async function createQuizOption(
  client: SupabaseClient,
  questionId: string,
  text: string,
  isCorrect: boolean
): Promise<{ id: string; text: string; isCorrect: boolean }> {
  const { data, error } = await client
    .from("quiz_options")
    .insert({ question_id: questionId, text, is_correct: isCorrect })
    .select("id, text, is_correct")
    .single();
  if (error) throw error;
  return { id: data.id, text: data.text, isCorrect: data.is_correct };
}

export async function updateQuizOption(
  client: SupabaseClient,
  id: string,
  text: string,
  isCorrect: boolean
): Promise<void> {
  const { error } = await client
    .from("quiz_options")
    .update({ text, is_correct: isCorrect })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteQuizOption(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("quiz_options").delete().eq("id", id);
  if (error) throw error;
}

// --- Learner-facing flow: never touches is_correct except via the two RPCs,
// which enforce that server-side. See supabase/schemas/40_quizzes.sql /
// 80_completion.sql. ---

export interface PublicQuizOption {
  id: string;
  questionId: string;
  text: string;
}

export async function getQuizOptionsForLearner(
  client: SupabaseClient,
  quizId: string
): Promise<PublicQuizOption[]> {
  const { data, error } = await client.rpc("get_quiz_options", { p_quiz_id: quizId });
  if (error) throw error;
  return (data as { id: string; question_id: string; text: string }[]).map((r) => ({
    id: r.id,
    questionId: r.question_id,
    text: r.text,
  }));
}

export interface PublicQuizQuestion {
  id: string;
  quizId: string;
  question: string;
  type: QuizQuestion["type"];
  order: number;
  options: PublicQuizOption[];
}

/**
 * Question + option text for taking a quiz, with NO is_correct anywhere --
 * questions come from a direct (RLS-gated) table read, options come from
 * get_quiz_options() (the RPC that strips is_correct). This is what the
 * quiz-taking UI renders; grading happens entirely server-side via
 * submitQuizAttempt.
 */
export async function getQuizQuestionsForLearner(
  client: SupabaseClient,
  quizId: string
): Promise<PublicQuizQuestion[]> {
  const [{ data: questionRows, error: questionsError }, options] = await Promise.all([
    client.from("quiz_questions").select("id, quiz_id, question, type, order").eq("quiz_id", quizId).order("order", { ascending: true }),
    getQuizOptionsForLearner(client, quizId),
  ]);
  if (questionsError) throw questionsError;

  return (questionRows as QuestionRow[]).map((q) => ({
    id: q.id,
    quizId: q.quiz_id,
    question: q.question,
    type: q.type as QuizQuestion["type"],
    order: q.order,
    options: options.filter((o) => o.questionId === q.id),
  }));
}

export async function submitQuizAttempt(
  client: SupabaseClient,
  quizId: string,
  answers: Record<string, string[]>
): Promise<QuizAttempt> {
  const { data, error } = await client.rpc("submit_quiz_attempt", {
    p_quiz_id: quizId,
    p_answers: answers,
  });
  if (error) throw error;
  return {
    id: data.id,
    userId: data.user_id,
    quizId: data.quiz_id,
    score: data.score,
    passed: data.passed,
    answers: data.answers,
    attemptedAt: data.attempted_at,
  };
}

export interface QuizReviewRow {
  questionId: string;
  question: string;
  type: string;
  optionId: string;
  optionText: string;
  isCorrect: boolean;
  selected: boolean;
}

export async function getQuizReview(client: SupabaseClient, attemptId: string): Promise<QuizReviewRow[]> {
  const { data, error } = await client.rpc("evaluate_quiz_review", { p_attempt_id: attemptId });
  if (error) throw error;
  return (
    data as {
      question_id: string;
      question: string;
      type: string;
      option_id: string;
      option_text: string;
      is_correct: boolean;
      selected: boolean;
    }[]
  ).map((r) => ({
    questionId: r.question_id,
    question: r.question,
    type: r.type,
    optionId: r.option_id,
    optionText: r.option_text,
    isCorrect: r.is_correct,
    selected: r.selected,
  }));
}

export async function getLatestPassingAttempt(
  client: SupabaseClient,
  userId: string,
  quizId: string
): Promise<QuizAttempt | undefined> {
  const { data, error } = await client
    .from("quiz_attempts")
    .select("id, user_id, quiz_id, score, passed, answers, attempted_at")
    .eq("user_id", userId)
    .eq("quiz_id", quizId)
    .eq("passed", true)
    .order("attempted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  return {
    id: data.id,
    userId: data.user_id,
    quizId: data.quiz_id,
    score: data.score,
    passed: data.passed,
    answers: data.answers,
    attemptedAt: data.attempted_at,
  };
}
