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
  objectives text[] not null default '{}',
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
