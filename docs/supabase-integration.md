# Supabase Integration Plan

This app currently runs entirely on mock data (`src/lib/mock-data.ts`) and a
localStorage-backed mock session (`src/context/auth-context.tsx`). The UI,
routes, and types were built to make swapping in Supabase a contained change
rather than a rewrite. This is the checklist for that swap.

Videos are **out of scope** for this integration — they stay on YouTube.
Only video *metadata* (`youtubeVideoId`, title, description, thumbnail,
duration, order, published) is ever persisted. Do not add a Storage bucket
or upload flow for video files.

## 1. Project setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only — used in server actions/route
     handlers that need elevated access, e.g. issuing certificates; never
     import it in a `"use client"` file)
3. `npm install @supabase/supabase-js @supabase/ssr`
4. Add `src/lib/supabase/client.ts` (browser client) and
   `src/lib/supabase/server.ts` (server client using `@supabase/ssr`'s
   `createServerClient`, wired into `src/middleware.ts` for session refresh).

## 2. Schema

Every table below maps directly to an interface in `src/lib/types.ts` —
column names are the snake_case version of the TS field names unless noted.

```sql
profiles (
  id uuid primary key references auth.users(id),
  full_name text not null,
  email text not null,
  role text not null default 'learner' check (role in ('learner','admin')),
  avatar_url text,
  created_at timestamptz not null default now()
)

courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text not null,
  description text not null,
  category text not null check (category in ('autism','adhd','dyslexia','workplace')),
  audience text[] not null default '{}',
  thumbnail_url text,
  estimated_minutes int not null default 0,
  level text not null default 'beginner',
  objectives text[] not null default '{}',
  requires_certificate boolean not null default true,
  published boolean not null default false,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
)

modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  description text,
  "order" int not null default 1
)

lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  description text,
  notes text,
  "order" int not null default 1,
  published boolean not null default false,
  youtube_video_id text not null,
  thumbnail_url text,
  duration_seconds int not null default 0
)

resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  type text not null check (type in ('pdf','slides','worksheet','guide','link')),
  category text not null,
  file_url text not null,
  course_id uuid references courses(id) on delete set null,
  module_id uuid references modules(id) on delete set null,
  lesson_id uuid references lessons(id) on delete set null,
  featured boolean default false,
  created_at timestamptz not null default now()
)

enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  status text not null default 'enrolled' check (status in ('enrolled','in-progress','completed')),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, course_id)
)

progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  enrollment_id uuid not null references enrollments(id) on delete cascade,
  watched_seconds int not null default 0,
  completed boolean not null default false,
  last_watched_at timestamptz not null default now(),
  unique (user_id, lesson_id)
)

quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  description text,
  pass_threshold int not null default 70
)

quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  question text not null,
  type text not null default 'single-choice',
  "order" int not null default 1
)

quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references quiz_questions(id) on delete cascade,
  text text not null,
  is_correct boolean not null default false
)

quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  quiz_id uuid not null references quizzes(id) on delete cascade,
  score int not null,
  passed boolean not null,
  answers jsonb not null default '{}',
  attempted_at timestamptz not null default now()
)

certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  learner_name text not null,
  course_title text not null,
  issued_at timestamptz not null default now(),
  certificate_url text
)

accessibility_preferences (
  user_id uuid primary key references profiles(id) on delete cascade,
  dark_mode boolean default false,
  dyslexia_font boolean default false,
  text_scale text default 'default',
  focus_mode boolean default false,
  read_aloud boolean default false
)
```

## 3. Row Level Security

Enable RLS on every table above, then:

- `profiles`: user can `select`/`update` their own row (`id = auth.uid()`);
  admins can `select` all (`exists (select 1 from profiles p where p.id =
  auth.uid() and p.role = 'admin')`).
- `courses`, `modules`, `lessons`, `resources`, `quizzes`, `quiz_questions`,
  `quiz_options`: public `select` where the parent course's `published =
  true`; `insert`/`update`/`delete` restricted to admins.
- `enrollments`, `progress`, `quiz_attempts`, `certificates`,
  `accessibility_preferences`: user can `select`/`insert`/`update` only rows
  where `user_id = auth.uid()`; admins can `select` all.

## 4. Wiring the app

Replace internals only — keep exported function signatures the same so
pages/components don't need to change:

1. **`src/context/auth-context.tsx`** — replace the mock `login`/`register`/
   `logout` with `supabase.auth.signInWithPassword` /
   `supabase.auth.signUp` / `supabase.auth.signOut`, and hydrate `user` from
   `supabase.auth.onAuthStateChange` + a `profiles` row fetch instead of
   `localStorage`.
2. **`src/lib/mock-data.ts`** — replace each exported function
   (`getCourseBySlug`, `getModulesForCourse`, `getEnrollmentsForUser`, …)
   with an equivalent Supabase query. Since every page imports these by
   name, most pages need zero changes. Convert the ones on the critical
   path (course catalogue, course detail, lesson) to server components
   fetching via `src/lib/supabase/server.ts` where it makes sense for SEO.
3. **`src/hooks/use-local-progress.ts`** — replace with direct
   `progress`/`quiz_attempts` table writes; delete the localStorage
   fallback once done.
4. **`src/app/admin/**`** — replace local `useState` CRUD with Supabase
   `insert`/`update`/`delete` calls, and re-check `role = 'admin'` in a
   server component or middleware, not just client-side (`RequireAuth` is a
   UX convenience only — see its comment).
5. **`middleware.ts`** (new) — use `@supabase/ssr` to refresh the session
   cookie on every request, and redirect unauthenticated requests away from
   `/dashboard` and `/admin/*` before the page even renders.
6. **Certificates** — on quiz pass / course completion, call a Supabase Edge
   Function (or Next.js route handler using the service role key) that
   renders a PDF (`@react-pdf/renderer` or similar) and uploads it to a
   `certificates` Storage bucket, then writes the `certificates` row.
7. **AI NeuroGuide** — replace `src/lib/mock-ai.ts`'s `getMockAIResponse`
   with a call to a Supabase Edge Function that proxies to an LLM.

## 5. What stays exactly as-is

- `src/lib/types.ts` — already matches the schema above field-for-field.
- Every component under `src/components/**` — they're already data-shape
  agnostic (props in, JSX out).
- Route structure under `src/app/**`.
- The YouTube embed component (`youtube-embed-player.tsx`) and the rule
  that only `youtubeVideoId` + metadata are ever stored.
