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
