# Issues Tracker

## 2026-08-07 — Quizzes forced on every module instead of being optional/end-of-course

**Reported by:** lms@chinitrust.org
**Status:** Fixed

### Problem

On the lesson page, finishing the last lesson of any module showed a "You've
reached the end of this module — Take the quiz" card whenever that module had
a quiz attached. This made every quiz feel mandatory and interrupted the
learner mid-course, on every module, instead of only at the point a course
actually requires one.

Desired behavior: quizzes should be optional when a course is set up, and if
a quiz is marked required, it should only prompt the learner after the whole
course is completed — not after each module.

### Root cause

The `quizzes` table had no required/optional concept at all — a quiz's mere
existence for a module was implicitly treated as mandatory:
- `private.run_course_completion` (SQL) blocked course completion/certificate
  issuance on *any* unpassed quiz tied to the course.
- The lesson page CTA (`src/app/lessons/[lessonId]/page.tsx`) rendered the
  "take the quiz" interstitial whenever `isLastInModule && moduleQuiz`, with
  no way to opt out.

### Fix

Added an `is_required` boolean column to `public.quizzes` (default `true` so
existing courses keep their current behavior) and threaded it through the
app:

- **Schema/migration:** `supabase/schemas/40_quizzes.sql`,
  `supabase/schemas/80_completion.sql`,
  `supabase/migrations/20260807124639_optional_quizzes.sql` —
  `private.run_course_completion` now only blocks completion on unpassed
  quizzes where `is_required = true`.
- **Types/data layer:** `src/lib/types.ts` (`Quiz.isRequired`),
  `src/lib/data/quizzes.ts` (`QuizInput.isRequired`, new
  `getQuizzesForCourse`).
- **Admin UI:** `src/app/admin/quizzes/quizzes-table.tsx` — new
  Required/Optional switch on the quiz form (defaults to **optional** for
  newly created quizzes), plus a Required/Optional column in the table.
- **Lesson page:** `src/app/lessons/[lessonId]/page.tsx` — the end-of-module
  interstitial now only renders for **optional** quizzes (framed as an
  ungated self-check). Required quizzes no longer interrupt mid-course.
- **Module page:** `src/app/courses/[courseId]/modules/[moduleId]/page.tsx`
  — still shows the quiz card either way (so optional quizzes stay
  reachable), now badged Required/Optional.
- **Course overview page:** `src/app/courses/[courseId]/page.tsx` — once a
  learner has completed every lesson in the course, a new "one last step"
  card lists any unpassed required quizzes with links to take them. This is
  the only place required quizzes are now surfaced to the learner.
- **Seed data:** `scripts/seed-data.ts`, `scripts/seed-mock-data.ts` —
  updated to set `isRequired: true` / `is_required` for the four existing
  mock quizzes, matching the "existing quizzes stay required" migration
  default.

### Verification

- `npx tsc --noEmit` — clean.
- `npm run lint` — clean (one pre-existing unrelated warning in
  `scripts/seed-data.ts`).
- `npm run build` — compiles and type-checks successfully; the prerender
  step fails only due to missing Supabase env vars in this sandbox
  (unrelated to this change, not run against a live DB).
- Not yet manually verified against a running Supabase instance/browser —
  recommend applying the migration and clicking through: create an optional
  quiz (no end-of-module prompt, still reachable from module page), create a
  required quiz (no per-module prompt; appears on course overview page only
  after all lessons are marked complete; blocks certificate until passed).
