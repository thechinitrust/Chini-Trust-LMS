alter table public.lessons add column if not exists objectives text[] not null default '{}';

-- Standalone calendar events (webinars, deadlines, live Q&A, announcements)
-- shown on the dashboard's "Upcoming" widget. RLS mirrors courses exactly.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  link_url text,
  category text not null default 'announcement'
    check (category in ('webinar', 'deadline', 'live-qa', 'announcement')),
  published boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_starts_at_idx on public.events (starts_at);
create index events_created_by_idx on public.events (created_by);

create trigger set_events_updated_at
  before update on public.events
  for each row
  execute function private.set_updated_at();

alter table public.events enable row level security;

create policy "events_select_published_or_admin"
  on public.events for select
  to anon, authenticated
  using (published or private.is_admin());

create policy "events_admin_insert"
  on public.events for insert
  to authenticated
  with check (private.is_admin());

create policy "events_admin_update"
  on public.events for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "events_admin_delete"
  on public.events for delete
  to authenticated
  using (private.is_admin());

-- Course-completion / certificate-issuance / quiz-review logic. All three are
-- SECURITY DEFINER (need to read/write rows the caller's own RLS wouldn't
-- otherwise allow, e.g. is_correct, or writing enrollments/certificates that
-- have no direct authenticated-write policy) and are authenticated-only.

-- Flips a fresh enrollment to 'in-progress' the first time a learner
-- actually starts watching something in that course.
create or replace function public.touch_enrollment_progress(p_course_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'must be authenticated';
  end if;

  update public.enrollments
  set status = 'in-progress'
  where user_id = v_user_id
    and course_id = p_course_id
    and status = 'enrolled';
end;
$$;

-- Checks whether the caller has completed every published lesson and passed
-- every quiz in a course; if so, marks the enrollment completed and issues a
-- certificate (row only -- no PDF, see supabase/schemas/50_certificates.sql).
-- "Passed" means any passing attempt ever, not just the most recent one --
-- there's no attempt-invalidation concept in this schema.
create or replace function public.evaluate_course_completion(p_course_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_lessons_incomplete boolean;
  v_quizzes_unpassed boolean;
  v_requires_certificate boolean;
begin
  if v_user_id is null then
    raise exception 'must be authenticated';
  end if;

  select exists (
    select 1
    from public.lessons l
    where l.course_id = p_course_id
      and l.published
      and not exists (
        select 1 from public.progress p
        where p.lesson_id = l.id and p.user_id = v_user_id and p.completed
      )
  ) into v_lessons_incomplete;

  select exists (
    select 1
    from public.quizzes q
    where q.course_id = p_course_id
      and not exists (
        select 1 from public.quiz_attempts qa
        where qa.quiz_id = q.id and qa.user_id = v_user_id and qa.passed
      )
  ) into v_quizzes_unpassed;

  if v_lessons_incomplete or v_quizzes_unpassed then
    return;
  end if;

  update public.enrollments
  set status = 'completed', completed_at = coalesce(completed_at, now())
  where user_id = v_user_id and course_id = p_course_id and status <> 'completed';

  select requires_certificate into v_requires_certificate
  from public.courses where id = p_course_id;

  if v_requires_certificate then
    insert into public.certificates (user_id, course_id, learner_name, course_title)
    select v_user_id, p_course_id, p.full_name, c.title
    from public.profiles p, public.courses c
    where p.id = v_user_id and c.id = p_course_id
    on conflict (user_id, course_id) do nothing;
  end if;
end;
$$;

-- Per-question/option review for one of the caller's OWN quiz attempts --
-- the only place is_correct is ever revealed to a non-admin, and only after
-- the fact, scoped to an attempt they own (never another learner's).
create or replace function public.evaluate_quiz_review(p_attempt_id uuid)
returns table (
  question_id uuid,
  question text,
  type text,
  option_id uuid,
  option_text text,
  is_correct boolean,
  selected boolean
)
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_quiz_id uuid;
  v_answers jsonb;
begin
  if v_user_id is null then
    raise exception 'must be authenticated';
  end if;

  select qa.quiz_id, qa.answers into v_quiz_id, v_answers
  from public.quiz_attempts qa
  where qa.id = p_attempt_id and qa.user_id = v_user_id;

  if v_quiz_id is null then
    raise exception 'quiz attempt % not found', p_attempt_id;
  end if;

  return query
    select
      qq.id,
      qq.question,
      qq.type,
      qo.id,
      qo.text,
      qo.is_correct,
      coalesce((v_answers -> qq.id::text) @> to_jsonb(qo.id::text), false) as selected
    from public.quiz_questions qq
    join public.quiz_options qo on qo.question_id = qq.id
    where qq.quiz_id = v_quiz_id
    order by qq."order", qo.text;
end;
$$;

revoke execute on function public.touch_enrollment_progress(uuid) from public, anon, authenticated;
grant execute on function public.touch_enrollment_progress(uuid) to authenticated;

revoke execute on function public.evaluate_course_completion(uuid) from public, anon, authenticated;
grant execute on function public.evaluate_course_completion(uuid) to authenticated;

revoke execute on function public.evaluate_quiz_review(uuid) from public, anon, authenticated;
grant execute on function public.evaluate_quiz_review(uuid) to authenticated;
