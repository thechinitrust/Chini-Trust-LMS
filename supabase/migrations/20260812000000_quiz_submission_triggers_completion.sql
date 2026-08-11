-- Passing a required quiz was never re-checking course-completion
-- eligibility, so a learner who finished all lessons first and then passed
-- the quiz last never got their enrollment marked completed or their
-- certificate issued (only re-touching a lesson, or an admin manually
-- re-checking, would fix it). Mirror the lesson-progress path
-- (upsertLessonProgress -> evaluate_course_completion) by re-running
-- completion eligibility right after a passing attempt is recorded.
create or replace function public.submit_quiz_attempt(p_quiz_id uuid, p_answers jsonb)
returns public.quiz_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_pass_threshold int;
  v_course_id uuid;
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

  select pass_threshold, course_id into v_pass_threshold, v_course_id
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

  -- A passing attempt can be the last remaining piece of course-completion
  -- eligibility (e.g. lessons were already finished earlier), so re-run the
  -- same check the lesson-progress path runs -- see 80_completion.sql.
  if v_passed then
    perform private.run_course_completion(v_user_id, v_course_id);
  end if;

  return v_result;
end;
$$;
