# CHINI Learn — Implementation Plan

Companion to [vision.md](vision.md). Sequenced so the UI is built first
against mock data, and Supabase is wired in as the final integration phase —
swapping mock data for a real backend rather than building against it from
day one. Videos are never stored in Supabase — they live on YouTube and are
embedded on the site (see [supabase-integration.md](supabase-integration.md)
for why and how).

## Status

- ✅ **Phase 0 — Project setup**: Next.js 15 + TypeScript + Tailwind +
  shadcn/ui scaffold, design tokens, base layout.
- ✅ **Phase 1 — Core UI on mock data**: all public pages, auth screens,
  learner dashboard, course/module/lesson pages, admin shell.
- ✅ **Phase 2 — Remaining features on mock data**: quizzes, certificates,
  downloadable resources, admin CRUD for every content type.
- ✅ **Phase 3 — Polish & verification**: accessibility controls (dark mode,
  dyslexia font, text scale, focus mode), responsive layout, build/lint
  clean, manually driven through every route with zero console errors.
- ⬜ **Phase 4 — Supabase integration**: not started. Full plan in
  [supabase-integration.md](supabase-integration.md).
- ⬜ **Phase 5 — Hardening & launch**: RLS security testing, production
  deploy, custom domain.
- ⬜ **Phase 6 — Nice-to-haves**: cohorts/learner groups, certificate
  verification page, notifications, expanded reporting.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 15 (App Router, TypeScript) + Tailwind + shadcn/ui | SEO-friendly, fast to build, huge ecosystem |
| Backend/DB/Auth | Supabase (Postgres, Auth, Storage, RLS) — **next phase** | Managed, generous free tier, low maintenance |
| Video | YouTube (unlisted, embedded via IFrame API) | Zero storage/bandwidth cost, reliable CDN |
| Non-video files (PDFs, thumbnails, certs) | Supabase Storage — **next phase** | Only non-video assets |
| Hosting | Vercel (recommended) | Free/cheap tier, native Next.js support |
| Certificates | PDF generation in a serverless function — **next phase** | Generate on completion, store in Supabase |

## Why Supabase last

Building the UI first against mock data means the team (and content team)
can review and approve flows before the schema locks in, schema design is
informed by what the UI actually needs, and integration risk is isolated to
one phase instead of spread across the whole build. That mock layer lives
entirely in `src/lib/mock-data.ts`, `src/context/auth-context.tsx`, and
`src/hooks/use-local-progress.ts` — see the README's "What's mocked right
now" section for the full list.

## Open questions to confirm before Phase 4

- Who are the initial admin users, and how are they provisioned (manual DB
  flag vs. invite flow)?
- Are quizzes graded automatically only (multiple choice/true-false), or is
  manual/instructor grading needed for any course?
- Certificate design — any specific branding/template requirements from The
  Chini Trust beyond what's in the current certificate page?
- Any accessibility standard to target explicitly (e.g. WCAG 2.1 AA), given
  the inclusion-focused audience?
