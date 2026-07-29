# Supabase Integration — What Was Actually Built

This replaces the original pre-migration plan (the schema drafted there matched
closely; the wiring approach ended up more structural than "swap the data
source" — see below). The app is now fully wired to Supabase: no mock data,
no localStorage-backed progress, real auth, real RLS, real RBAC.

Videos remain **out of scope for storage** — only YouTube video metadata
(`youtube_video_id`, thumbnail, duration) is ever persisted; no upload/Storage
bucket for video files.

## Architecture

Every content-bearing page is an **async Server Component** (fetches via
`src/lib/supabase/server.ts`) with small `"use client"` islands for
interactive pieces (enroll button, video/progress tracking, quiz form, admin
CRUD dialogs). Plain synchronous mock-data lookups couldn't become async in
place, so this was a real restructuring, not just a data-source swap — see
`src/app/courses/[courseId]/page.tsx` + `course-enroll-panel.tsx` for the
pattern used everywhere.

The public course route (`/courses/[courseId]`) resolves by **slug**, not id
(folder name kept for minimal diff).

## Schema

`supabase/schemas/*.sql` (declarative, applied via `supabase db query
--linked` — Docker isn't available locally for `db diff`/`db pull`, so schema
changes are applied directly and then captured into
`supabase/migrations/*.sql` by hand):

- `00_private.sql` — `private` schema, `is_admin()`, `set_updated_at()`,
  `handle_new_user()` (creates a `profiles` row on signup, hardcodes
  `role = 'learner'` always).
- `10_profiles.sql` — `profiles` + role-escalation guard trigger (blocked
  unless caller is already admin or the session isn't an end-user session at
  all — the bootstrap escape hatch for direct SQL / service-role access).
- `20_content.sql` — `courses`, `modules`, `lessons` (+ `objectives`
  column), `resources`.
- `30_learning.sql` — `enrollments`, `progress` (+
  `guard_progress_enrollment` trigger enforcing `enrollment_id` really
  belongs to the same user/course as the lesson).
- `40_quizzes.sql` — `quizzes`, `quiz_questions`, `quiz_options` (admin-only
  RLS — no learner-facing select policy at all), `quiz_attempts` (no
  learner-facing insert policy). Two RPCs: `get_quiz_options` (strips
  `is_correct`) and `submit_quiz_attempt` (server-side grading).
- `50_certificates.sql` — `certificates` + private Storage bucket (bucket
  unused so far — PDF rendering is still deferred, row-only issuance).
- `60_accessibility.sql` — `accessibility_preferences` (schema exists;
  `src/context/accessibility-context.tsx` still manages this client-side —
  not wired to the table, out of scope for this pass).
- `70_events.sql` — `events` (webinar/deadline/live-qa/announcement), RLS
  mirrors `courses`.
- `80_completion.sql` — `touch_enrollment_progress`, `evaluate_course_completion`
  / `admin_recheck_course_completion` (shared logic in
  `private.run_course_completion`), `evaluate_quiz_review`.

## Data-access layer

`src/lib/data/*.ts` — one module per entity (`courses`, `modules`, `lessons`,
`resources`, `quizzes`, `enrollments`, `progress`, `certificates`, `events`,
`users`, `admin-stats`). Every function takes a Supabase client as its first
argument so the same function works from a Server Component or a `"use
client"` mutation. Maps snake_case DB rows to the camelCase shapes in
`src/lib/types.ts`.

Quiz functions split into two families: admin (`getQuestionsForQuiz`, direct
table CRUD — sees `is_correct`) and learner-facing (`getQuizQuestionsForLearner`,
`submitQuizAttempt`, `getQuizReview`, `getLatestPassingAttempt` — all backed
by RPCs, never see `is_correct` before submission).

## Real-time features

- **Enrollment**: `course-enroll-panel.tsx`, real insert, one row per
  `(user, course)`.
- **Lesson progress**: `youtube-embed-player.tsx` loads the real YouTube
  IFrame Player API (not a bare iframe) — resumes from last position, reports
  progress every ~10s, auto-completes at ~90% watched.
  `lessons/[lessonId]/lesson-player.tsx` persists writes and calls the
  completion RPCs. Manual "Mark complete" still available as an
  accessibility-friendly override. A learner deep-linking to a lesson with no
  enrollment yet is auto-enrolled server-side.
- **Quizzes**: `quizzes/[quizId]/quiz-taker.tsx` — options never carry
  `is_correct` pre-submission; grading is server-side via
  `submitQuizAttempt`; post-submit review uses `getQuizReview` (scoped to the
  caller's own attempt only). Shows a "you already passed this" banner via
  `getLatestPassingAttempt`.
- **Certificates**: no dedicated issuance UI — a pure side effect of
  `evaluate_course_completion`, triggered from the lesson-completion and
  quiz-pass paths. Admin can also issue/revoke manually and re-check
  eligibility for a specific learner via `admin_recheck_course_completion`.
- **Dashboard**: real day-streak (consecutive UTC calendar days with a
  `progress` write), real "Upcoming" widget (`events`), everything else
  swapped from mock to real queries.

## Admin panel

All 8 original sections wired to real CRUD (courses/modules/lessons/resources/
quizzes/users/certificates/overview) plus a new **Events** section. Notable
additions beyond a straight data-source swap:

- **Quiz question/option editor** (`/admin/quizzes/[quizId]`) — didn't exist
  before in any form; nested accordion editor for questions + options with
  an `is_correct` toggle.
- **User invite/delete** (`src/app/api/admin/invite-user/route.ts`,
  `delete-user/route.ts`) — Route Handlers, not client calls or Server
  Actions, because creating/deleting a real `auth.users` row needs the
  `service_role` key (`src/lib/supabase/admin.ts`, server-only), which can
  never reach the browser. Both re-verify the caller is an admin from their
  own session before touching the service-role client. Role
  promote/demote doesn't need the service role — the existing
  `guard_profile_role_change` trigger already permits an admin caller.
- **Overview stats/charts** — real aggregate queries
  (`src/lib/data/admin-stats.ts`), replacing the previous hardcoded/fabricated
  numbers.

## Seeding

`scripts/seed-mock-data.ts` + `scripts/seed-data.ts` (frozen sample content,
independent of the app's `src/lib/mock-data.ts`, which now only holds the
About-page team roster). Run via `npm run seed`. Safe to re-run — deletes by
known slug/title before inserting. Useful for populating a fresh or staging
Supabase project with realistic demo content; also exercises
`evaluate_course_completion` as an end-to-end smoke test by calling it as the
seeded learner instead of hand-inserting the certificate row.

## Dev-only Quick Login

`src/app/login/page.tsx`, gated behind `NEXT_PUBLIC_ENABLE_QUICK_LOGIN` (see
`.env.example`). Logs into the two seeded accounts
(`admin@neurobridge.com` / `user@neurobridge.com`). Set the flag to `false`
(or delete the block) before shipping to production.

## Known gaps / explicitly deferred

- Certificate **PDF rendering** — row + Storage bucket exist, no renderer yet.
- `accessibility_preferences` table isn't wired to
  `accessibility-context.tsx` yet.
- Real SMTP for Supabase Auth emails (currently on the shared low-rate-limit
  test sender) — needed before enabling email confirmation for real public
  signups at scale.
