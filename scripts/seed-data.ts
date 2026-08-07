/**
 * Frozen sample content for scripts/seed-mock-data.ts, split out from
 * src/lib/mock-data.ts (which now only keeps the About-page team roster --
 * see that file's comment). This file is NOT imported by the app; it only
 * feeds the one-off seed script, so it's fine for its shapes to drift
 * slightly from src/lib/types.ts (e.g. no moduleIds/lessonIds/questionIds
 * arrays -- Supabase models those the other direction, via FKs).
 */
import type { Certificate, Course, Enrollment, LessonProgress, Lesson, Module, Quiz, QuizAttempt, QuizQuestion, Resource } from "@/lib/types";

const PLACEHOLDER_YT_ID = "aqz-KE-bpKQ";

export const CURRENT_LEARNER_ID = "profile-jamie";

export const mockCourses: Course[] = [
  {
    id: "course-autism",
    slug: "understanding-autism",
    title: "Understanding Autism",
    summary: "A foundational look at autism spectrum experiences and how to support them.",
    description:
      "This course introduces the core concepts of autism spectrum experiences from a neurodiversity-affirming perspective. You'll learn how autism presents across ages and contexts, common misconceptions, and concrete ways to make everyday environments more accessible and welcoming for autistic students, colleagues, and family members.",
    category: "autism",
    audience: ["teachers", "parents", "students"],
    thumbnailUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    estimatedMinutes: 95,
    level: "beginner",
    objectives: [
      "Describe autism as a spectrum of experiences, not a fixed profile",
      "Recognise common sensory and communication differences",
      "Apply three practical strategies for inclusive classrooms and workplaces",
      "Identify reliable resources for continued learning",
    ],
    requiresCertificate: true,
    published: true,
    createdAt: "2026-01-10T09:00:00.000Z",
    previewVideoId: PLACEHOLDER_YT_ID,
  },
  {
    id: "course-adhd",
    slug: "adhd-explained",
    title: "ADHD Explained",
    summary: "Understand attention, executive function, and support strategies for ADHD.",
    description:
      "ADHD Explained walks through the science of attention and executive function, why traditional classroom and workplace structures can create friction for ADHD minds, and how small structural changes lead to outsized improvements in focus, follow-through, and wellbeing.",
    category: "adhd",
    audience: ["teachers", "parents", "employers"],
    thumbnailUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
    estimatedMinutes: 80,
    level: "beginner",
    objectives: [
      "Explain executive function and its role in ADHD",
      "Differentiate inattentive, hyperactive, and combined presentations",
      "Design routines and accommodations that reduce friction",
      "Support self-advocacy for ADHD learners and employees",
    ],
    requiresCertificate: true,
    published: true,
    createdAt: "2026-01-18T09:00:00.000Z",
    previewVideoId: PLACEHOLDER_YT_ID,
  },
  {
    id: "course-dyslexia",
    slug: "supporting-dyslexia",
    title: "Supporting Dyslexia",
    summary: "Evidence-based approaches to reading differences and dyslexia-friendly design.",
    description:
      "Supporting Dyslexia demystifies how dyslexia affects reading and written language, separates myth from evidence, and gives educators and parents a practical toolkit — from structured literacy approaches to dyslexia-friendly formatting — to help learners thrive.",
    category: "dyslexia",
    audience: ["teachers", "parents", "students"],
    thumbnailUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    estimatedMinutes: 70,
    level: "beginner",
    objectives: [
      "Explain what dyslexia is and isn't",
      "Recognise early signs across age groups",
      "Apply dyslexia-friendly formatting and reading strategies",
      "Build confidence-first support plans with learners",
    ],
    requiresCertificate: true,
    published: true,
    createdAt: "2026-02-02T09:00:00.000Z",
    previewVideoId: PLACEHOLDER_YT_ID,
  },
  {
    id: "course-workplace",
    slug: "workplace-inclusion",
    title: "Workplace Inclusion",
    summary: "Build neuroinclusive hiring, onboarding, and management practices.",
    description:
      "Workplace Inclusion is built for employers and managers who want practical, low-cost ways to make hiring, onboarding, and day-to-day management more accessible to neurodivergent employees — without a compliance-driven, checkbox approach.",
    category: "workplace",
    audience: ["employers", "neurodivergent-individuals"],
    thumbnailUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
    estimatedMinutes: 60,
    level: "intermediate",
    objectives: [
      "Audit hiring processes for unnecessary barriers",
      "Design onboarding that reduces uncertainty",
      "Offer accommodations proactively and respectfully",
      "Build a psychologically safe team culture",
    ],
    requiresCertificate: true,
    published: true,
    createdAt: "2026-02-20T09:00:00.000Z",
    previewVideoId: PLACEHOLDER_YT_ID,
  },
];

export const mockModules: Module[] = [
  {
    id: "mod-autism-1",
    courseId: "course-autism",
    title: "Foundations of the Autism Spectrum",
    description: "What autism is, how it presents, and why the spectrum model matters.",
    order: 1,
  },
  {
    id: "mod-autism-2",
    courseId: "course-autism",
    title: "Practical Support Strategies",
    description: "Sensory-friendly environments and communication approaches that work.",
    order: 2,
  },
  {
    id: "mod-adhd-1",
    courseId: "course-adhd",
    title: "How Attention & Executive Function Work",
    description: "The science behind focus, impulsivity, and time-blindness in ADHD.",
    order: 1,
  },
  {
    id: "mod-adhd-2",
    courseId: "course-adhd",
    title: "Building Supportive Structures",
    description: "Routines, tools, and accommodations that reduce day-to-day friction.",
    order: 2,
  },
  {
    id: "mod-dyslexia-1",
    courseId: "course-dyslexia",
    title: "What Dyslexia Is (and Isn't)",
    description: "The reading science, common myths, and early signs to watch for.",
    order: 1,
  },
  {
    id: "mod-dyslexia-2",
    courseId: "course-dyslexia",
    title: "Dyslexia-Friendly Practice",
    description: "Structured literacy basics and formatting that reduces reading friction.",
    order: 2,
  },
  {
    id: "mod-workplace-1",
    courseId: "course-workplace",
    title: "Neuroinclusive Hiring & Management",
    description: "Practical changes to hiring, onboarding, and everyday management.",
    order: 1,
  },
];

function lesson(
  partial: Omit<Lesson, "video"> & {
    /** Per-lesson override; defaults to the shared placeholder. */
    youtubeVideoId?: string;
    durationSeconds?: number;
    /** Historical only -- resources point at lessons, not vice versa. */
    resourceIds?: string[];
  }
): Lesson {
  const { youtubeVideoId, durationSeconds, resourceIds: _resourceIds, ...rest } = partial;
  const videoId = youtubeVideoId ?? PLACEHOLDER_YT_ID;
  return {
    ...rest,
    video: {
      youtubeVideoId: videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      durationSeconds: durationSeconds ?? 11 * 60 + 42,
    },
  };
}

export const mockLessons: Lesson[] = [
  lesson({
    id: "lesson-autism-1-1",
    moduleId: "mod-autism-1",
    courseId: "course-autism",
    title: "What Is the Autism Spectrum?",
    description: "An evidence-based introduction to autism as a spectrum of experiences.",
    notes: "Key idea: 'spectrum' describes variation across traits, not a line from mild to severe.",
    order: 1,
    published: true,
    durationSeconds: 14 * 60 + 20,
    resourceIds: ["resource-understanding-autism"],
    objectives: [
      "Define autism as variation across multiple traits",
      "Explain why 'high' and 'low functioning' labels mislead",
      "Describe how presentation changes with context and age",
    ],
  }),
  lesson({
    id: "lesson-autism-1-2",
    moduleId: "mod-autism-1",
    courseId: "course-autism",
    title: "Common Misconceptions, Addressed",
    description: "Separating outdated stereotypes from current understanding.",
    order: 2,
    published: true,
    durationSeconds: 9 * 60 + 45,
    objectives: [
      "Identify three widespread myths and the evidence against them",
      "Recognise how masking hides support needs",
    ],
  }),
  lesson({
    id: "lesson-autism-2-1",
    moduleId: "mod-autism-2",
    courseId: "course-autism",
    title: "Designing Sensory-Friendly Spaces",
    description: "Lighting, sound, and layout changes that make a real difference.",
    order: 1,
    published: true,
    durationSeconds: 12 * 60 + 10,
    resourceIds: ["resource-sensory-room-checklist"],
    objectives: [
      "Audit a room for sensory load in under ten minutes",
      "Apply low-cost lighting and acoustic adjustments",
      "Offer regulation-friendly seating and break options",
    ],
  }),
  lesson({
    id: "lesson-autism-2-2",
    moduleId: "mod-autism-2",
    courseId: "course-autism",
    title: "Communication That Works",
    description: "Direct language, processing time, and alternative communication supports.",
    order: 2,
    published: true,
    durationSeconds: 10 * 60 + 30,
    objectives: [
      "Use literal, unambiguous phrasing for instructions",
      "Build in processing time before expecting a response",
      "Support AAC and non-speaking communication respectfully",
    ],
  }),
  lesson({
    id: "lesson-adhd-1-1",
    moduleId: "mod-adhd-1",
    courseId: "course-adhd",
    title: "Attention Isn't a Switch",
    description: "Why 'just focus' misunderstands how ADHD attention actually works.",
    order: 1,
    published: true,
    durationSeconds: 11 * 60 + 15,
    objectives: [
      "Describe attention as regulation rather than capacity",
      "Explain hyperfocus and why it coexists with distractibility",
    ],
  }),
  lesson({
    id: "lesson-adhd-1-2",
    moduleId: "mod-adhd-1",
    courseId: "course-adhd",
    title: "Executive Function 101",
    description: "Planning, working memory, and time-blindness explained simply.",
    order: 2,
    published: true,
    durationSeconds: 13 * 60 + 5,
    resourceIds: ["resource-executive-function-slides"],
    objectives: [
      "Name the core executive functions and how they interact",
      "Connect working-memory load to everyday task breakdown",
      "Explain time-blindness without framing it as carelessness",
    ],
  }),
  lesson({
    id: "lesson-adhd-2-1",
    moduleId: "mod-adhd-2",
    courseId: "course-adhd",
    title: "Routines That Actually Stick",
    description: "External structure beats willpower — here's how to build it.",
    order: 1,
    published: true,
    durationSeconds: 10 * 60 + 50,
    resourceIds: ["resource-adhd-classroom-strategies"],
    objectives: [
      "Externalise working memory with visible cues and checklists",
      "Design routines that survive a bad day",
      "Use body-doubling and timers without shame framing",
    ],
  }),
  lesson({
    id: "lesson-adhd-2-2",
    moduleId: "mod-adhd-2",
    courseId: "course-adhd",
    title: "Accommodations at School and Work",
    description: "Low-cost, high-impact accommodations you can request or offer today.",
    order: 2,
    published: true,
    durationSeconds: 12 * 60 + 40,
    objectives: [
      "Match common friction points to specific accommodations",
      "Frame an accommodation request constructively",
    ],
  }),
  lesson({
    id: "lesson-dyslexia-1-1",
    moduleId: "mod-dyslexia-1",
    courseId: "course-dyslexia",
    title: "How Reading Actually Develops",
    description: "The phonological foundation of reading and where dyslexia intervenes.",
    order: 1,
    published: true,
    durationSeconds: 13 * 60 + 30,
    objectives: [
      "Trace the path from phonemic awareness to fluent reading",
      "Locate where dyslexia creates friction in that path",
    ],
  }),
  lesson({
    id: "lesson-dyslexia-1-2",
    moduleId: "mod-dyslexia-1",
    courseId: "course-dyslexia",
    title: "Spotting Early Signs by Age Group",
    description: "What to look for in early years, primary, and secondary learners.",
    order: 2,
    published: true,
    durationSeconds: 11 * 60,
    objectives: [
      "Recognise age-appropriate warning signs",
      "Distinguish dyslexia from a broader reading delay",
      "Know when and how to escalate for assessment",
    ],
  }),
  lesson({
    id: "lesson-dyslexia-2-1",
    moduleId: "mod-dyslexia-2",
    courseId: "course-dyslexia",
    title: "Structured Literacy, Simply Explained",
    description: "The approach behind most effective dyslexia interventions.",
    order: 1,
    published: true,
    durationSeconds: 15 * 60 + 20,
    resourceIds: ["resource-parent-toolkit"],
    objectives: [
      "Explain what makes instruction explicit and systematic",
      "Apply dyslexia-friendly formatting to your own materials",
      "Build a confidence-first support plan with a learner",
    ],
  }),
  lesson({
    id: "lesson-workplace-1-1",
    moduleId: "mod-workplace-1",
    courseId: "course-workplace",
    title: "Auditing Your Hiring Funnel",
    description: "Finding and removing unintentional barriers in job ads and interviews.",
    order: 1,
    published: true,
    durationSeconds: 12 * 60 + 55,
    resourceIds: ["resource-inclusive-workplace-guide"],
    objectives: [
      "Rewrite a job ad to remove unnecessary requirements",
      "Share interview questions in advance without losing rigour",
      "Offer alternative assessment formats",
    ],
  }),
  lesson({
    id: "lesson-workplace-1-2",
    moduleId: "mod-workplace-1",
    courseId: "course-workplace",
    title: "Onboarding That Reduces Uncertainty",
    description: "Structured onboarding as an accommodation that helps everyone.",
    order: 2,
    published: true,
    durationSeconds: 9 * 60 + 35,
    resourceIds: ["resource-accommodation-request-template"],
    objectives: [
      "Design a first-week plan that removes ambiguity",
      "Offer accommodations proactively rather than on request",
    ],
  }),
];

export const mockResources: Resource[] = [
  {
    id: "resource-adhd-classroom-strategies",
    title: "ADHD Classroom Strategies",
    summary: "A one-page reference of low-prep strategies teachers can use immediately.",
    type: "guide",
    category: "teachers",
    fileUrl: "/resources/adhd-classroom-strategies.pdf",
    courseId: "course-adhd",
    featured: true,
    createdAt: "2026-01-20T09:00:00.000Z",
  },
  {
    id: "resource-understanding-autism",
    title: "Understanding Autism",
    summary: "A plain-language primer for families new to an autism diagnosis.",
    type: "guide",
    category: "parents",
    fileUrl: "/resources/understanding-autism.pdf",
    courseId: "course-autism",
    featured: true,
    createdAt: "2026-01-12T09:00:00.000Z",
  },
  {
    id: "resource-parent-toolkit",
    title: "Parent Toolkit",
    summary: "Conversation starters, IEP-meeting prep, and at-home reading support ideas.",
    type: "worksheet",
    category: "parents",
    fileUrl: "/resources/parent-toolkit.pdf",
    courseId: "course-dyslexia",
    featured: true,
    createdAt: "2026-02-05T09:00:00.000Z",
  },
  {
    id: "resource-inclusive-workplace-guide",
    title: "Inclusive Workplace Guide",
    summary: "A manager's checklist for neuroinclusive hiring and day-to-day support.",
    type: "guide",
    category: "employers",
    fileUrl: "/resources/inclusive-workplace-guide.pdf",
    courseId: "course-workplace",
    featured: true,
    createdAt: "2026-02-22T09:00:00.000Z",
  },
  {
    id: "resource-student-self-advocacy",
    title: "Self-Advocacy Starter Kit",
    summary: "Scripts and templates for students requesting accommodations.",
    type: "worksheet",
    category: "students",
    fileUrl: "/resources/self-advocacy-starter-kit.pdf",
    createdAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "resource-sensory-room-checklist",
    title: "Sensory-Friendly Room Checklist",
    summary: "A walkthrough checklist for auditing classroom or office sensory load.",
    type: "worksheet",
    category: "teachers",
    fileUrl: "/resources/sensory-room-checklist.pdf",
    courseId: "course-autism",
    createdAt: "2026-01-25T09:00:00.000Z",
  },
  {
    id: "resource-executive-function-slides",
    title: "Executive Function, Explained",
    summary: "Slide deck suitable for staff training sessions.",
    type: "slides",
    category: "teachers",
    fileUrl: "/resources/executive-function-explained.pdf",
    courseId: "course-adhd",
    createdAt: "2026-01-28T09:00:00.000Z",
  },
  {
    id: "resource-accommodation-request-template",
    title: "Workplace Accommodation Request Template",
    summary: "A fillable template employees can use to request accommodations.",
    type: "worksheet",
    category: "employers",
    fileUrl: "/resources/accommodation-request-template.pdf",
    courseId: "course-workplace",
    createdAt: "2026-03-05T09:00:00.000Z",
  },
];

export const mockQuizzes: Quiz[] = [
  {
    id: "quiz-autism",
    moduleId: "mod-autism-2",
    courseId: "course-autism",
    title: "Autism Foundations Check",
    description: "Five questions covering the spectrum model and support strategies.",
    passThreshold: 70,
    isRequired: true,
  },
  {
    id: "quiz-adhd",
    moduleId: "mod-adhd-2",
    courseId: "course-adhd",
    title: "ADHD Essentials Check",
    description: "Quick check on executive function and support strategies.",
    passThreshold: 70,
    isRequired: true,
  },
  {
    id: "quiz-dyslexia",
    moduleId: "mod-dyslexia-2",
    courseId: "course-dyslexia",
    title: "Dyslexia Fundamentals Check",
    description: "Confirm your understanding of reading science and support strategies.",
    passThreshold: 70,
    isRequired: true,
  },
  {
    id: "quiz-workplace",
    moduleId: "mod-workplace-1",
    courseId: "course-workplace",
    title: "Inclusive Workplace Check",
    description: "Test your grasp of neuroinclusive hiring and onboarding practices.",
    passThreshold: 70,
    isRequired: true,
  },
];

export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: "q-autism-1",
    quizId: "quiz-autism",
    question: "Autism is best understood as:",
    type: "single-choice",
    order: 1,
    options: [
      { id: "a", text: "A single fixed set of traits present in everyone diagnosed", isCorrect: false },
      { id: "b", text: "A spectrum of experiences that vary across individuals", isCorrect: true },
      { id: "c", text: "A behavioral phase children grow out of", isCorrect: false },
    ],
  },
  {
    id: "q-autism-2",
    quizId: "quiz-autism",
    question: "Which of these is a practical sensory-friendly adjustment?",
    type: "single-choice",
    order: 2,
    options: [
      { id: "a", text: "Dimmable lighting and reduced background noise", isCorrect: true },
      { id: "b", text: "Requiring eye contact during conversation", isCorrect: false },
      { id: "c", text: "Removing all breaks from the schedule", isCorrect: false },
    ],
  },
  {
    id: "q-autism-3",
    quizId: "quiz-autism",
    question: "Giving extra processing time after asking a question is a form of:",
    type: "single-choice",
    order: 3,
    options: [
      { id: "a", text: "Lowering expectations", isCorrect: false },
      { id: "b", text: "A communication accommodation", isCorrect: true },
      { id: "c", text: "An unnecessary delay", isCorrect: false },
    ],
  },
  {
    id: "q-adhd-1",
    quizId: "quiz-adhd",
    question: "ADHD attention difficulties are best described as:",
    type: "single-choice",
    order: 1,
    options: [
      { id: "a", text: "An inability to focus on anything", isCorrect: false },
      { id: "b", text: "Difficulty regulating attention across tasks", isCorrect: true },
      { id: "c", text: "A lack of effort or willpower", isCorrect: false },
    ],
  },
  {
    id: "q-adhd-2",
    quizId: "quiz-adhd",
    question: "External structure (checklists, timers, visible routines) helps because:",
    type: "single-choice",
    order: 2,
    options: [
      { id: "a", text: "It replaces the need for working memory", isCorrect: true },
      { id: "b", text: "It is required by law", isCorrect: false },
      { id: "c", text: "It only works for children", isCorrect: false },
    ],
  },
  {
    id: "q-adhd-3",
    quizId: "quiz-adhd",
    question: "Time-blindness refers to:",
    type: "single-choice",
    order: 3,
    options: [
      { id: "a", text: "Difficulty estimating and sensing the passage of time", isCorrect: true },
      { id: "b", text: "Being chronically late on purpose", isCorrect: false },
      { id: "c", text: "A vision impairment", isCorrect: false },
    ],
  },
  {
    id: "q-dyslexia-1",
    quizId: "quiz-dyslexia",
    question: "Dyslexia primarily affects:",
    type: "single-choice",
    order: 1,
    options: [
      { id: "a", text: "General intelligence", isCorrect: false },
      { id: "b", text: "Phonological processing related to reading", isCorrect: true },
      { id: "c", text: "Vision only", isCorrect: false },
    ],
  },
  {
    id: "q-dyslexia-2",
    quizId: "quiz-dyslexia",
    question: "Structured literacy approaches emphasize:",
    type: "single-choice",
    order: 2,
    options: [
      { id: "a", text: "Guessing words from pictures", isCorrect: false },
      { id: "b", text: "Explicit, systematic phonics instruction", isCorrect: true },
      { id: "c", text: "Avoiding reading aloud entirely", isCorrect: false },
    ],
  },
  {
    id: "q-workplace-1",
    quizId: "quiz-workplace",
    question: "A neuroinclusive job ad audit should check for:",
    type: "single-choice",
    order: 1,
    options: [
      { id: "a", text: "Unnecessary jargon and vague requirements", isCorrect: true },
      { id: "b", text: "The longest possible list of requirements", isCorrect: false },
      { id: "c", text: "Requiring a personality test", isCorrect: false },
    ],
  },
  {
    id: "q-workplace-2",
    quizId: "quiz-workplace",
    question: "Structured onboarding benefits:",
    type: "single-choice",
    order: 2,
    options: [
      { id: "a", text: "Only neurodivergent employees", isCorrect: false },
      { id: "b", text: "All new hires, by reducing ambiguity", isCorrect: true },
      { id: "c", text: "Only remote employees", isCorrect: false },
    ],
  },
];

export const mockEnrollments: Enrollment[] = [
  {
    id: "enrollment-1",
    userId: CURRENT_LEARNER_ID,
    courseId: "course-autism",
    status: "in-progress",
    enrolledAt: "2026-06-01T09:00:00.000Z",
  },
  {
    id: "enrollment-2",
    userId: CURRENT_LEARNER_ID,
    courseId: "course-adhd",
    status: "completed",
    enrolledAt: "2026-04-10T09:00:00.000Z",
    completedAt: "2026-05-02T09:00:00.000Z",
  },
  {
    id: "enrollment-3",
    userId: CURRENT_LEARNER_ID,
    courseId: "course-dyslexia",
    status: "enrolled",
    enrolledAt: "2026-07-20T09:00:00.000Z",
  },
];

export const mockLessonProgress: LessonProgress[] = [
  {
    id: "progress-1",
    userId: CURRENT_LEARNER_ID,
    lessonId: "lesson-autism-1-1",
    enrollmentId: "enrollment-1",
    watchedSeconds: 702,
    completed: true,
    lastWatchedAt: "2026-07-21T18:20:00.000Z",
  },
  {
    id: "progress-2",
    userId: CURRENT_LEARNER_ID,
    lessonId: "lesson-autism-1-2",
    enrollmentId: "enrollment-1",
    watchedSeconds: 200,
    completed: false,
    lastWatchedAt: "2026-07-24T20:05:00.000Z",
  },
  ...mockLessons
    .filter((l) => l.courseId === "course-adhd")
    .map((l, i): LessonProgress => ({
      id: `progress-adhd-${i}`,
      userId: CURRENT_LEARNER_ID,
      lessonId: l.id,
      enrollmentId: "enrollment-2",
      watchedSeconds: l.video.durationSeconds,
      completed: true,
      lastWatchedAt: "2026-05-01T12:00:00.000Z",
    })),
];

export const mockQuizAttempts: QuizAttempt[] = [
  {
    id: "attempt-1",
    userId: CURRENT_LEARNER_ID,
    quizId: "quiz-adhd",
    score: 100,
    passed: true,
    answers: { "q-adhd-1": ["b"], "q-adhd-2": ["a"], "q-adhd-3": ["a"] },
    attemptedAt: "2026-05-02T08:45:00.000Z",
  },
];

export const mockCertificates: Certificate[] = [
  {
    id: "certificate-adhd-jamie",
    userId: CURRENT_LEARNER_ID,
    courseId: "course-adhd",
    learnerName: "Jamie Rivera",
    courseTitle: "ADHD Explained",
    issuedAt: "2026-05-02T09:00:00.000Z",
  },
];
