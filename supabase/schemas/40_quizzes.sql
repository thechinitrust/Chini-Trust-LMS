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
