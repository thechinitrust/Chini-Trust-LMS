-- Private, non-exposed schema for RLS helper functions and triggers.
-- Nothing in here is reachable via the Data API (PostgREST only exposes
-- `public` by default), so these functions are safe to run as
-- SECURITY DEFINER without becoming public RPC endpoints.
create schema if not exists private;

-- USAGE only -- lets anon/authenticated *resolve* private.xxx identifiers
-- referenced from RLS policies and SECURITY INVOKER trigger functions.
-- Actual access to any specific object in this schema is still gated by
-- that object's own grants (only private.is_admin() has EXECUTE below);
-- nothing in `private` is exposed via the Data API regardless, since
-- PostgREST only serves the `public` schema.
grant usage on schema private to anon, authenticated;

-- Returns true when the currently authenticated user's profile has
-- role = 'admin'. SECURITY DEFINER so it can read `profiles` regardless of
-- the caller's RLS grants, avoiding recursive-policy evaluation when used
-- inside a policy on `profiles` itself.
-- plpgsql (not sql) so this can be created before public.profiles exists --
-- plpgsql function bodies aren't validated against the catalog until first
-- execution, unlike `language sql`, which breaks the 00 -> 10 file order.
create or replace function private.is_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  return exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
end;
$$;

-- Granted to anon too: every "published content" RLS policy is `to anon,
-- authenticated` and calls private.is_admin() as part of its USING clause
-- (e.g. `using (published or private.is_admin())`). Postgres checks EXECUTE
-- privilege on a function referenced in a policy regardless of whether OR
-- short-circuits around it, so without this grant every anonymous read of
-- published content fails with "permission denied for function is_admin".
revoke execute on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

-- Shared `updated_at` maintenance trigger for admin-editable tables.
create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Creates the `profiles` row for every new auth.users signup. Role is
-- always hardcoded to 'learner' here -- raw_user_meta_data is user-editable
-- at signup time and must never be trusted for authorization.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    'learner'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function private.handle_new_user();
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  role text not null default 'learner' check (role in ('learner', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per auth.users signup, created by private.handle_new_user(). '
  'role is app-level RBAC and must never be set from client-supplied '
  'auth metadata -- see private.handle_new_user() and the role-guard trigger below.';

alter table public.profiles enable row level security;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function private.set_updated_at();

-- Blocks role self-escalation: a row's `role` can only change when the
-- caller is already an admin (checked via private.is_admin(), not the row
-- being modified), regardless of what the UPDATE's WITH CHECK allows.
create or replace function private.guard_profile_role_change()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- (select auth.uid()) is null for connections that aren't an end-user
  -- PostgREST session (the SQL editor, migrations, the service_role key) --
  -- those are trusted operator access and must be able to bootstrap the
  -- first admin. Only sessions authenticated as a specific end user (where
  -- auth.uid() is set) are held to the private.is_admin() check.
  if new.role is distinct from old.role
     and (select auth.uid()) is not null
     and not private.is_admin() then
    raise exception 'only admins may change profile role';
  end if;
  return new;
end;
$$;

create trigger guard_profile_role_change
  before update on public.profiles
  for each row
  execute function private.guard_profile_role_change();

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id or private.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id or private.is_admin())
  with check ((select auth.uid()) = id or private.is_admin());

-- No insert/delete policies: rows are created by private.handle_new_user()
-- (SECURITY DEFINER, bypasses RLS as table owner) and deleted via
-- `on delete cascade` from auth.users. Nothing else should insert/delete here.
-- Content tree: courses -> modules -> lessons, plus standalone resources.
-- Column names/nullability mirror src/lib/types.ts field-for-field.

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text not null,
  description text not null,
  category text not null check (category in ('autism', 'adhd', 'dyslexia', 'workplace')),
  audience text[] not null default '{}'
    check (audience <@ array['students', 'parents', 'teachers', 'employers', 'neurodivergent-individuals']::text[]),
  thumbnail_url text not null default '',
  estimated_minutes int not null default 0 check (estimated_minutes >= 0),
  level text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  objectives text[] not null default '{}',
  requires_certificate boolean not null default true,
  published boolean not null default false,
  preview_video_id text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courses_created_by_idx on public.courses (created_by);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text not null default '',
  "order" int not null default 1,
  updated_at timestamptz not null default now()
);

create index modules_course_id_idx on public.modules (course_id);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text not null default '',
  notes text,
  "order" int not null default 1,
  published boolean not null default false,
  youtube_video_id text not null,
  thumbnail_url text not null default '',
  duration_seconds int not null default 0 check (duration_seconds >= 0),
  updated_at timestamptz not null default now()
);

create index lessons_module_id_idx on public.lessons (module_id);
create index lessons_course_id_idx on public.lessons (course_id);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null default '',
  type text not null check (type in ('pdf', 'slides', 'worksheet', 'guide', 'link')),
  category text not null check (category in ('students', 'parents', 'teachers', 'employers', 'neurodivergent-individuals')),
  file_url text not null,
  course_id uuid references public.courses (id) on delete set null,
  module_id uuid references public.modules (id) on delete set null,
  lesson_id uuid references public.lessons (id) on delete set null,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index resources_course_id_idx on public.resources (course_id);
create index resources_module_id_idx on public.resources (module_id);
create index resources_lesson_id_idx on public.resources (lesson_id);

create trigger set_courses_updated_at before update on public.courses
  for each row execute function private.set_updated_at();
create trigger set_modules_updated_at before update on public.modules
  for each row execute function private.set_updated_at();
create trigger set_lessons_updated_at before update on public.lessons
  for each row execute function private.set_updated_at();
create trigger set_resources_updated_at before update on public.resources
  for each row execute function private.set_updated_at();

alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.resources enable row level security;

-- Courses: public catalogue browsing for published courses; admins see/edit all.
create policy "courses_select_published_or_admin"
  on public.courses for select
  to anon, authenticated
  using (published or private.is_admin());

-- Per-action (not `for all`) admin policies: `for all` would also apply to
-- SELECT and double up with courses_select_published_or_admin above.
create policy "courses_admin_insert"
  on public.courses for insert
  to authenticated
  with check (private.is_admin());

create policy "courses_admin_update"
  on public.courses for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "courses_admin_delete"
  on public.courses for delete
  to authenticated
  using (private.is_admin());

-- Modules inherit visibility from their parent course.
create policy "modules_select_published_or_admin"
  on public.modules for select
  to anon, authenticated
  using (
    private.is_admin()
    or exists (
      select 1 from public.courses c
      where c.id = modules.course_id and c.published
    )
  );

create policy "modules_admin_insert"
  on public.modules for insert
  to authenticated
  with check (private.is_admin());

create policy "modules_admin_update"
  on public.modules for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "modules_admin_delete"
  on public.modules for delete
  to authenticated
  using (private.is_admin());

-- Lessons need both their own `published` flag and the parent course's.
create policy "lessons_select_published_or_admin"
  on public.lessons for select
  to anon, authenticated
  using (
    private.is_admin()
    or (
      published
      and exists (
        select 1 from public.courses c
        where c.id = lessons.course_id and c.published
      )
    )
  );

create policy "lessons_admin_insert"
  on public.lessons for insert
  to authenticated
  with check (private.is_admin());

create policy "lessons_admin_update"
  on public.lessons for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "lessons_admin_delete"
  on public.lessons for delete
  to authenticated
  using (private.is_admin());

-- Resources: standalone (course_id is null) resources are always public;
-- course-attached resources follow that course's published flag.
create policy "resources_select_public_or_published_or_admin"
  on public.resources for select
  to anon, authenticated
  using (
    private.is_admin()
    or course_id is null
    or exists (
      select 1 from public.courses c
      where c.id = resources.course_id and c.published
    )
  );

create policy "resources_admin_insert"
  on public.resources for insert
  to authenticated
  with check (private.is_admin());

create policy "resources_admin_update"
  on public.resources for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "resources_admin_delete"
  on public.resources for delete
  to authenticated
  using (private.is_admin());
-- Enrollment + per-lesson progress tracking. Owner-writable, admin-readable-all.

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  status text not null default 'enrolled' check (status in ('enrolled', 'in-progress', 'completed')),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, course_id)
);

create index enrollments_user_id_idx on public.enrollments (user_id);
create index enrollments_course_id_idx on public.enrollments (course_id);

create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  watched_seconds int not null default 0 check (watched_seconds >= 0),
  completed boolean not null default false,
  last_watched_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index progress_user_id_idx on public.progress (user_id);
create index progress_lesson_id_idx on public.progress (lesson_id);
create index progress_enrollment_id_idx on public.progress (enrollment_id);

-- Data-integrity guard: a progress row's enrollment must actually belong to
-- the same user and cover the same course as the lesson being progressed.
-- RLS (below) only checks `user_id = auth.uid()`; without this a client
-- could pass someone else's enrollment_id and still satisfy that check.
create or replace function private.guard_progress_enrollment()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  lesson_course_id uuid;
begin
  select course_id into lesson_course_id from public.lessons where id = new.lesson_id;

  if not exists (
    select 1 from public.enrollments e
    where e.id = new.enrollment_id
      and e.user_id = new.user_id
      and e.course_id = lesson_course_id
  ) then
    raise exception 'enrollment_id must belong to the same user and course as lesson_id';
  end if;

  return new;
end;
$$;

create trigger guard_progress_enrollment
  before insert or update on public.progress
  for each row
  execute function private.guard_progress_enrollment();

alter table public.enrollments enable row level security;
alter table public.progress enable row level security;

create policy "enrollments_owner_select"
  on public.enrollments for select
  to authenticated
  using ((select auth.uid()) = user_id or private.is_admin());

create policy "enrollments_owner_insert"
  on public.enrollments for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "enrollments_owner_update"
  on public.enrollments for update
  to authenticated
  using ((select auth.uid()) = user_id or private.is_admin())
  with check ((select auth.uid()) = user_id or private.is_admin());

create policy "enrollments_admin_delete"
  on public.enrollments for delete
  to authenticated
  using (private.is_admin());

create policy "progress_owner_select"
  on public.progress for select
  to authenticated
  using ((select auth.uid()) = user_id or private.is_admin());

create policy "progress_owner_insert"
  on public.progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "progress_owner_update"
  on public.progress for update
  to authenticated
  using ((select auth.uid()) = user_id or private.is_admin())
  with check ((select auth.uid()) = user_id or private.is_admin());
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text not null default '',
  pass_threshold int not null default 70 check (pass_threshold between 0 and 100),
  updated_at timestamptz not null default now()
);

create index quizzes_module_id_idx on public.quizzes (module_id);
create index quizzes_course_id_idx on public.quizzes (course_id);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  question text not null,
  type text not null default 'single-choice' check (type in ('single-choice', 'multiple-choice', 'true-false')),
  "order" int not null default 1,
  updated_at timestamptz not null default now()
);

create index quiz_questions_quiz_id_idx on public.quiz_questions (quiz_id);

-- Correct-answer data lives here. This table has NO select policy for
-- regular users (see RLS below) -- it is admin-only. Learners read
-- options through get_quiz_options(), which omits is_correct, and submit
-- answers through submit_quiz_attempt() for server-side grading.
create table public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions (id) on delete cascade,
  text text not null,
  is_correct boolean not null default false,
  updated_at timestamptz not null default now()
);

create index quiz_options_question_id_idx on public.quiz_options (question_id);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  score int not null check (score between 0 and 100),
  passed boolean not null,
  answers jsonb not null default '{}',
  attempted_at timestamptz not null default now()
);

create index quiz_attempts_user_id_idx on public.quiz_attempts (user_id);
create index quiz_attempts_quiz_id_idx on public.quiz_attempts (quiz_id);

create trigger set_quizzes_updated_at before update on public.quizzes
  for each row execute function private.set_updated_at();
create trigger set_quiz_questions_updated_at before update on public.quiz_questions
  for each row execute function private.set_updated_at();
create trigger set_quiz_options_updated_at before update on public.quiz_options
  for each row execute function private.set_updated_at();

-- Returns safe (no is_correct) option columns for a quiz's questions, once
-- the parent course is published. SECURITY DEFINER so it can read past
-- quiz_options' admin-only RLS -- a *function* rather than a view, since the
-- Postgres security linter flags any non-security-invoker view as a
-- "Security Definer View" ERROR regardless of intent; a table-returning
-- function doesn't trip that specific check.
create or replace function public.get_quiz_options(p_quiz_id uuid)
returns table (id uuid, question_id uuid, text text)
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if not exists (
    select 1
    from public.quizzes q
    join public.courses c on c.id = q.course_id
    where q.id = p_quiz_id and c.published
  ) then
    return;
  end if;

  return query
    select qo.id, qo.question_id, qo.text
    from public.quiz_options qo
    join public.quiz_questions qq on qq.id = qo.question_id
    where qq.quiz_id = p_quiz_id;
end;
$$;

revoke execute on function public.get_quiz_options(uuid) from public;
grant execute on function public.get_quiz_options(uuid) to anon, authenticated;

alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options enable row level security;
alter table public.quiz_attempts enable row level security;

create policy "quizzes_select_published_or_admin"
  on public.quizzes for select
  to anon, authenticated
  using (
    private.is_admin()
    or exists (select 1 from public.courses c where c.id = quizzes.course_id and c.published)
  );

-- Split into per-action (not `for all`) policies so they don't also cover
-- SELECT and double-evaluate alongside quizzes_select_published_or_admin.
create policy "quizzes_admin_insert"
  on public.quizzes for insert
  to authenticated
  with check (private.is_admin());

create policy "quizzes_admin_update"
  on public.quizzes for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "quizzes_admin_delete"
  on public.quizzes for delete
  to authenticated
  using (private.is_admin());

create policy "quiz_questions_select_published_or_admin"
  on public.quiz_questions for select
  to anon, authenticated
  using (
    private.is_admin()
    or exists (
      select 1 from public.quizzes q
      join public.courses c on c.id = q.course_id
      where q.id = quiz_questions.quiz_id and c.published
    )
  );

create policy "quiz_questions_admin_insert"
  on public.quiz_questions for insert
  to authenticated
  with check (private.is_admin());

create policy "quiz_questions_admin_update"
  on public.quiz_questions for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "quiz_questions_admin_delete"
  on public.quiz_questions for delete
  to authenticated
  using (private.is_admin());

-- Deliberately admin-only: no select/insert/update/delete policy for plain
-- authenticated/anon users. Learner-facing reads go through
-- get_quiz_options(); grading goes through submit_quiz_attempt().
create policy "quiz_options_admin_all"
  on public.quiz_options for all
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "quiz_attempts_select_own_or_admin"
  on public.quiz_attempts for select
  to authenticated
  using ((select auth.uid()) = user_id or private.is_admin());

create policy "quiz_attempts_admin_insert"
  on public.quiz_attempts for insert
  to authenticated
  with check (private.is_admin());

create policy "quiz_attempts_admin_update"
  on public.quiz_attempts for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "quiz_attempts_admin_delete"
  on public.quiz_attempts for delete
  to authenticated
  using (private.is_admin());

-- Grades a quiz attempt server-side and records it. SECURITY DEFINER so it
-- can read is_correct (which RLS hides from the caller) and insert into
-- quiz_attempts (which has no insert policy for regular users) -- this
-- function is the *only* way a non-admin can create a quiz_attempts row.
-- p_answers shape matches QuizAttempt['answers'] in src/lib/types.ts:
-- { [questionId: string]: string[] } (selected option ids per question).
create or replace function public.submit_quiz_attempt(p_quiz_id uuid, p_answers jsonb)
returns public.quiz_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_pass_threshold int;
  v_total int;
  v_correct int := 0;
  v_score int;
  v_passed boolean;
  v_question record;
  v_submitted_ids text[];
  v_correct_ids text[];
  v_result public.quiz_attempts;
begin
  if v_user_id is null then
    raise exception 'must be authenticated to submit a quiz attempt';
  end if;

  select pass_threshold into v_pass_threshold
  from public.quizzes where id = p_quiz_id;

  if v_pass_threshold is null then
    raise exception 'quiz % not found', p_quiz_id;
  end if;

  select count(*) into v_total
  from public.quiz_questions where quiz_id = p_quiz_id;

  if v_total = 0 then
    raise exception 'quiz % has no questions', p_quiz_id;
  end if;

  for v_question in
    select id from public.quiz_questions where quiz_id = p_quiz_id
  loop
    select coalesce(array_agg(value order by value), '{}')
      into v_submitted_ids
      from jsonb_array_elements_text(coalesce(p_answers -> v_question.id::text, '[]'::jsonb));

    select coalesce(array_agg(id::text order by id::text), '{}')
      into v_correct_ids
      from public.quiz_options
      where question_id = v_question.id and is_correct;

    if v_submitted_ids = v_correct_ids then
      v_correct := v_correct + 1;
    end if;
  end loop;

  v_score := round(100.0 * v_correct / v_total);
  v_passed := v_score >= v_pass_threshold;

  insert into public.quiz_attempts (user_id, quiz_id, score, passed, answers)
  values (v_user_id, p_quiz_id, v_score, v_passed, p_answers)
  returning * into v_result;

  return v_result;
end;
$$;

-- Explicitly revoke from anon too: Supabase grants EXECUTE on new public
-- functions to anon/authenticated by default privileges, which `revoke
-- ... from public` alone does not undo for roles that already hold a
-- direct grant.
revoke execute on function public.submit_quiz_attempt(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated;
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  learner_name text not null,
  course_title text not null,
  issued_at timestamptz not null default now(),
  certificate_url text,
  unique (user_id, course_id)
);

create index certificates_user_id_idx on public.certificates (user_id);
create index certificates_course_id_idx on public.certificates (course_id);

alter table public.certificates enable row level security;

create policy "certificates_select_own_or_admin"
  on public.certificates for select
  to authenticated
  using ((select auth.uid()) = user_id or private.is_admin());

-- Deliberately no insert/update/delete policy for plain authenticated
-- users: certificates are issued by the system (future PDF-render Edge
-- Function running with the service_role key, which bypasses RLS) or by an
-- admin, never self-reported by the learner.
-- Per-action (not `for all`) so it doesn't also cover SELECT and double up
-- with certificates_select_own_or_admin above.
create policy "certificates_admin_insert"
  on public.certificates for insert
  to authenticated
  with check (private.is_admin());

create policy "certificates_admin_update"
  on public.certificates for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "certificates_admin_delete"
  on public.certificates for delete
  to authenticated
  using (private.is_admin());

-- Private bucket. Files are only ever written by the future service-role
-- Edge Function or an admin; learners may only download their own.
-- Path convention: {user_id}/{certificate_id}.pdf
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('certificates', 'certificates', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

create policy "certificate_objects_select_own_or_admin"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'certificates'
    and (
      (select auth.uid())::text = (storage.foldername(name))[1]
      or private.is_admin()
    )
  );

create policy "certificate_objects_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'certificates' and private.is_admin());

create policy "certificate_objects_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'certificates' and private.is_admin())
  with check (bucket_id = 'certificates' and private.is_admin());

create policy "certificate_objects_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'certificates' and private.is_admin());
create table public.accessibility_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  dark_mode boolean not null default false,
  dyslexia_font boolean not null default false,
  text_scale text not null default 'default' check (text_scale in ('default', 'lg', 'xl')),
  focus_mode boolean not null default false,
  read_aloud boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.accessibility_preferences enable row level security;

create trigger set_accessibility_preferences_updated_at
  before update on public.accessibility_preferences
  for each row
  execute function private.set_updated_at();

create policy "accessibility_preferences_select_own_or_admin"
  on public.accessibility_preferences for select
  to authenticated
  using ((select auth.uid()) = user_id or private.is_admin());

create policy "accessibility_preferences_owner_insert"
  on public.accessibility_preferences for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "accessibility_preferences_owner_update"
  on public.accessibility_preferences for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
