/**
 * Domain types for CHINI Learn.
 *
 * Shaped to map 1:1 onto the future Supabase/Postgres schema (see
 * docs/supabase-schema.md once Supabase is wired in). Every entity here is
 * expected to become a table with the same fields, using snake_case column
 * names — these TS interfaces stay camelCase and get mapped at the data
 * access layer (src/lib/data/*) so the rest of the app never has to change.
 */

export type UserRole = "learner" | "admin";

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

/** Free text — admins can enter any category, not just the launch four. */
export type LearningCategory = string;

export type AudienceTag = "students" | "parents" | "teachers" | "employers" | "neurodivergent-individuals";

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  summary: string;
  category: LearningCategory;
  audience: AudienceTag[];
  thumbnailUrl: string;
  estimatedMinutes: number;
  level: "beginner" | "intermediate" | "advanced";
  objectives: string[];
  requiresCertificate: boolean;
  published: boolean;
  createdAt: string;
  /**
   * Optional course-level intro/trailer video shown at the top of the course
   * page. When unset the course page falls back to the first lesson's video.
   */
  previewVideoId?: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
}

/** Metadata-only video reference — the file itself lives on YouTube. */
export interface YoutubeVideoMeta {
  youtubeVideoId: string;
  thumbnailUrl: string;
  durationSeconds: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  notes?: string;
  order: number;
  published: boolean;
  video: YoutubeVideoMeta;
  /** What the learner should be able to do after this specific lesson. */
  objectives?: string[];
}

export type ResourceType = "pdf" | "slides" | "worksheet" | "guide" | "link";

export interface Resource {
  id: string;
  title: string;
  summary: string;
  type: ResourceType;
  category: AudienceTag;
  fileUrl: string;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  featured?: boolean;
  createdAt: string;
}

export type EnrollmentStatus = "enrolled" | "in-progress" | "completed";

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt?: string;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  enrollmentId: string;
  watchedSeconds: number;
  completed: boolean;
  lastWatchedAt: string;
}

export type QuizQuestionType = "single-choice" | "multiple-choice" | "true-false";

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  type: QuizQuestionType;
  order: number;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  passThreshold: number;
  isRequired: boolean;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  passed: boolean;
  answers: Record<string, string[]>;
  attemptedAt: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  learnerName: string;
  courseTitle: string;
  issuedAt: string;
  certificateUrl?: string;
}

export interface AccessibilityPreferences {
  userId: string;
  darkMode: boolean;
  dyslexiaFont: boolean;
  textScale: "default" | "lg" | "xl";
  focusMode: boolean;
  readAloud: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

/**
 * Placeholder team profile shown on the About page. Swap `name`, `role`,
 * `bio` and `photoUrl` for real staff details when they're available.
 */
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
}

export type EventCategory = "webinar" | "deadline" | "live-qa" | "announcement";

export interface LmsEvent {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  linkUrl?: string;
  category: EventCategory;
  published: boolean;
}
