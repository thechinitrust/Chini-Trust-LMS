# NeuroBridge

An accessibility-first platform for The Chini Trust: a neurodiversity
learning platform (LMS), resource library, and guidance assistant for
students, parents, teachers, employers, and neurodivergent individuals.

Brand colour: `#888820`. Accessibility tooling (dark mode, dyslexia-friendly
type, text scaling, focus mode, read-aloud) is a first-class feature, not an
add-on — see `src/context/accessibility-context.tsx` and
`src/components/accessibility/`.

This is the frontend scaffold — full routing, UI, and realistic sample data,
built to be wired up to Supabase next. Nothing here is connected to a real
backend yet; see [docs/supabase-integration.md](docs/supabase-integration.md)
for that plan.

## Tech stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (New York style) + lucide-react icons
- next-themes for dark mode
- Mock authentication + mock AI chat, both clearly marked `TODO(supabase)`
  in code for where real integrations go

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

**Demo login:** any email/password works. An email containing "admin"
signs you in as the mock admin (`/admin`); anything else signs you in as
the mock learner (`/dashboard`).

## Project structure

```
src/
  app/                  routes (App Router) — see below
  components/
    ui/                 shadcn/ui primitives (button, card, dialog, ...)
    layout/              navbar, footer, admin sidebar
    shared/               course/resource/lesson cards, quiz UI, empty/error states
    chat/                 AI NeuroGuide chat UI
    accessibility/        accessibility control row
    admin/                admin table + form building blocks
    auth/                 auth card, RequireAuth route guard
  context/               mock auth + accessibility preference contexts
  hooks/                use-local-progress.ts — localStorage-backed demo progress
  lib/
    types.ts            domain types, shaped to match the future Supabase schema
    mock-data.ts         sample courses/modules/lessons/quizzes/etc. + lookup helpers
    mock-ai.ts            canned AI NeuroGuide responses
    youtube.ts             YouTube ID/URL parsing + duration formatting
    toast.ts               sonner wrapper
docs/
  vision.md                 original product vision doc
  implementation-plan.md    phased build plan
  supabase-integration.md   exact steps for the next phase
```

### Routes

Public: `/`, `/learn`, `/resources`, `/ai-neuroguide`, `/accessibility`,
`/about`, `/login`, `/register`, `/forgot-password`.

Learner (mock-auth gated): `/dashboard`, `/courses/[courseId]`,
`/courses/[courseId]/modules/[moduleId]`, `/lessons/[lessonId]`,
`/quizzes/[quizId]`, `/certificates/[certificateId]`.

Admin (mock-auth + role gated): `/admin`, `/admin/courses`,
`/admin/modules`, `/admin/lessons`, `/admin/resources`, `/admin/quizzes`,
`/admin/users`, `/admin/certificates`.

## Videos: YouTube only

Per the product requirement, **no video is ever uploaded to or stored by
this app**. Lessons store only `youtubeVideoId` + metadata (title,
description, thumbnail, duration, order, published). The lesson page embeds
via the YouTube IFrame embed (`youtube-nocookie.com`); the admin "Lessons &
Videos" screen accepts a pasted YouTube ID or URL — never a file.

## What's mocked right now

- **Auth** — `src/context/auth-context.tsx`, session in localStorage.
- **All content** (courses/modules/lessons/resources/quizzes/certificates) —
  `src/lib/mock-data.ts`, static in-memory arrays.
- **Progress & quiz attempts** — `src/hooks/use-local-progress.ts`, overlaid
  on the mock data via localStorage so the demo feels real in a session.
- **AI NeuroGuide** — `src/lib/mock-ai.ts`, keyword-matched canned replies.
- **Admin CRUD** — local React state seeded from the mock arrays; changes
  don't persist across a reload.

Every one of these has a `TODO(supabase)` comment at its integration point.

## Next step: Supabase

See [docs/supabase-integration.md](docs/supabase-integration.md) for the
full schema, RLS policies, and file-by-file swap plan. Copy `.env.example`
to `.env.local` once you have a Supabase project to point at.
