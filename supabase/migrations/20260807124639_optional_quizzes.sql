-- Quizzes can now be marked optional. Required quizzes gate course
-- completion/certificate issuance and are surfaced on the course overview
-- page once every lesson is complete, rather than as a per-module
-- interstitial. Optional quizzes stay reachable from the module page as a
-- self-check but never block completion. Existing quizzes default to
-- required, preserving current completion behavior.
alter table public.quizzes add column is_required boolean not null default true;

create or replace function private.run_course_completion(p_user_id uuid, p_course_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lessons_incomplete boolean;
  v_quizzes_unpassed boolean;
  v_requires_certificate boolean;
begin
  select exists (
    select 1
    from public.lessons l
    where l.course_id = p_course_id
      and l.published
      and not exists (
        select 1 from public.progress p
        where p.lesson_id = l.id and p.user_id = p_user_id and p.completed
      )
  ) into v_lessons_incomplete;

  select exists (
    select 1
    from public.quizzes q
    where q.course_id = p_course_id
      and q.is_required
      and not exists (
        select 1 from public.quiz_attempts qa
        where qa.quiz_id = q.id and qa.user_id = p_user_id and qa.passed
      )
  ) into v_quizzes_unpassed;

  if v_lessons_incomplete or v_quizzes_unpassed then
    return;
  end if;

  update public.enrollments
  set status = 'completed', completed_at = coalesce(completed_at, now())
  where user_id = p_user_id and course_id = p_course_id and status <> 'completed';

  select requires_certificate into v_requires_certificate
  from public.courses where id = p_course_id;

  if v_requires_certificate then
    insert into public.certificates (user_id, course_id, learner_name, course_title)
    select p_user_id, p_course_id, p.full_name, c.title
    from public.profiles p, public.courses c
    where p.id = p_user_id and c.id = p_course_id
    on conflict (user_id, course_id) do nothing;
  end if;
end;
$$;
