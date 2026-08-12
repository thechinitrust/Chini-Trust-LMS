# CHINI Learn — Project Overview

**Last updated:** 2026-08-12

A short orientation doc: what this project is, how it's put together, and
what it currently does. For deeper detail see the other files in `docs/`
(linked at the bottom) — this one is deliberately kept short.

## What it is

CHINI Learn is an accessibility-first LMS (learning management system) built
for The Chini Trust, focused on neurodiversity and inclusive-education
training. It serves learners (mainly teachers, but scalable to parents,
therapists, employers), and gives admins a full content-management console —
courses, modules, lessons, quizzes, resources, events, speakers, certificates,
users.

Accessibility is a core product feature, not a bolt-on: dark mode, multiple
reading fonts (incl. dyslexia-friendly), text scaling, a focus-reading mode,
and read-aloud are all built into the shell of the app.

Videos are never uploaded or stored — lessons only ever reference a YouTube
video ID, embedded via `youtube-nocookie.com`.

## Tech stack

- **Next.js 15** (App Router) + **React 19** + TypeScript
- **Supabase** (Postgres + Auth + Storage) — real backend, no mock data
- **Tailwind CSS v4** + shadcn/ui (Radix primitives) + lucide-react icons
- **Tiptap** for rich-text editing (course/lesson content, objectives)
- Framer Motion / GSAP for animation, Recharts for admin charts, dnd-kit for
  drag-reordering

## How it's structured

```
src/app/            routes (Next.js App Router) — public, learner, admin
src/components/
  ui/                shadcn/ui primitives
  layout/            navbar, footer, admin sidebar
  shared/             course/resource/lesson cards, quiz UI, rich-text renderer
  accessibility/       accessibility control row, focus-mode bar, read-aloud
  admin/               admin table/form building blocks, rich-text editor, charts
  auth/                auth card, RequireAuth route guard
src/context/         accessibility preferences, auth session (client-side)
src/lib/
  supabase/            browser/server/admin Supabase clients
  data/                one module per entity — all real Supabase reads/writes
  types.ts             domain types matching the DB schema
supabase/
  schemas/             declarative Postgres schema (source of truth), by domain
  migrations/          applied migrations, hand-captured from schema changes
docs/                  this file + vision, Supabase integration notes, admin gap report
```

Pattern used throughout: content pages are async Server Components that fetch
directly from Supabase, with small `"use client"` islands for interactive
bits (enroll button, quiz form, admin CRUD dialogs, drag-reorder).

## What it currently does

### Courses, modules & lessons — the core content model

This is the heart of the product; everything else supports it. Content is a
strict three-level hierarchy:

**Course** → **Modules** (ordered sections) → **Lessons** (ordered, each one
video). A course carries title/summary/description, a free-text category,
audience tags (students/parents/teachers/employers/neurodivergent
individuals), a level, thumbnail + banner image, "What you'll learn"
objectives, an optional preview/trailer video, linked speakers, and a
publish toggle — unpublished courses are invisible to learners. Each lesson
holds a single YouTube video (ID only, never a file), its own notes and
objectives, duration, and its own publish toggle.

Learners **enroll** in a course, then move lesson by lesson at their own
pace; per-lesson watch/completion state (`progress`, tied to the enrollment)
is what powers "resume where you left off" and the course-completion
percentage on the dashboard and course page.

In the admin console, a course's modules and lessons are edited **inline on
one page** (`/admin/courses/[courseId]`) — add/edit/delete either level and
drag-to-reorder both, without leaving the course. Course/lesson descriptions
and objectives use a rich-text editor (Tiptap), not plain text.

### Quizzes

An optional add-on per module: single-choice / multiple-choice / true-false
questions, a pass threshold, graded server-side via a Postgres RPC. Each quiz
is **Required or Optional** — optional ones are an ungated self-check offered
at the end of a module; required ones only surface once every lesson in the
course is done, and block certificate issuance until passed.

### Certificates

Auto-issued the moment a learner finishes every lesson and passes every
required quiz in a course (server-side completion check, re-run after both
lesson progress and quiz submissions). Admins can also manually issue,
re-check eligibility, or revoke. The certificate page offers download (via
browser print), print, and a copy-link share action.

### Resources & Events

**Resources** — a downloadable-material library (PDF/slides/worksheet/guide/
link), tagged by audience, optionally linked to a specific course/module/
lesson, with a "featured" flag. **Events** — webinars, deadlines, live Q&As,
and announcements with a start time and location/link.

### Speakers *(in progress — see below)*

Reusable speaker profiles (name, role, organization, bio, photo) managed once
in `/admin/speakers` and linked to any number of courses, rather than
re-entered per course.

### Public site & accounts

Home, course catalogue (`/learn`), resource library (`/resources`), events,
about page, accessibility page, login/register/password reset — all backed
by real Supabase auth with two roles, `learner` and `admin`.

### Admin console

Everything above is real Supabase CRUD, RLS-enforced by role — courses,
modules, lessons, quizzes, resources, events, speakers, certificates, plus
**Users**: invite by email (real invite mail via service role), change role
learner↔admin, permanently delete.

### Accessibility controls

Site-wide, persisted per-browser: dark/light theme, 5 font choices (default,
dyslexia-friendly, Lato, Atkinson Hyperlegible, Lexend), text scaling, focus
mode, and read-aloud (page or selection).

## Backend / data model (Supabase)

Declarative schema in `supabase/schemas/`, one file per domain: `profiles`
(+ role-escalation guard), `courses`/`modules`/`lessons`/`resources`,
`enrollments`/`progress`, `quizzes`/`quiz_questions`/`quiz_options`/
`quiz_attempts`, `certificates` (+ storage bucket), `accessibility_preferences`
(schema exists, not yet wired to the client-side context), `events`,
`speakers`/`course_speakers` (new). Row-Level Security is on for every table;
almost everything is gated through `private.is_admin()`.

## Current in-progress work (uncommitted on `master`)

A **Speakers** feature was just built end-to-end but not yet committed:
`speakers` + `course_speakers` tables, a `speaker-photos` storage bucket,
`/admin/speakers` CRUD page with photo upload, a speaker-picker in the course
editor, and the data layer (`src/lib/data/speakers.ts`). Mock data
(`src/lib/mock-data.ts`) is being deleted as part of this pass — the app was
already fully off mock data for everything else. Several reference `.docx`/
`.pptx` speaker-bio source files are sitting untracked in the repo root,
presumably content for populating this feature.

## Known gaps (as of last audit, 2026-08-07 — see `admin-capabilities-report.md`)

No file-upload for generic resources (URL-only), no course "banner" hero
image at the time of that report (now addressed per recent commits), no
learner-facing profile/settings page, quiz question editor lacks
drag-to-reorder.

## Other docs in this folder

- `vision.md` — the original product brief from The Chini Trust
- `supabase-integration.md` — how/why the Supabase migration was structured
- `admin-capabilities-report.md` — dated snapshot of admin CRUD coverage and gaps
- `implementation-plan.md` — original phased build plan
