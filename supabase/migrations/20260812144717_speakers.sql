-- Speakers: reusable profiles (not duplicated per-course) shown on the About
-- page and linked to courses via course_speakers. Always public read (not
-- gated by course.published) since they're marketing/bio content.

create table public.speakers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '', -- designation/title
  organization text not null default '',
  bio text not null default '',
  photo_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_speakers (
  course_id uuid not null references public.courses (id) on delete cascade,
  speaker_id uuid not null references public.speakers (id) on delete cascade,
  primary key (course_id, speaker_id)
);

create index course_speakers_speaker_id_idx on public.course_speakers (speaker_id);

create trigger set_speakers_updated_at before update on public.speakers
  for each row execute function private.set_updated_at();

alter table public.speakers enable row level security;
alter table public.course_speakers enable row level security;

create policy "speakers_select_public"
  on public.speakers for select
  to anon, authenticated
  using (true);

create policy "speakers_admin_insert"
  on public.speakers for insert
  to authenticated
  with check (private.is_admin());

create policy "speakers_admin_update"
  on public.speakers for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "speakers_admin_delete"
  on public.speakers for delete
  to authenticated
  using (private.is_admin());

-- course_speakers is a pure join table: read is public, writes are admin
-- (via the "replace the set" pattern) delete + insert, never update.
create policy "course_speakers_select_public"
  on public.course_speakers for select
  to anon, authenticated
  using (true);

create policy "course_speakers_admin_insert"
  on public.course_speakers for insert
  to authenticated
  with check (private.is_admin());

create policy "course_speakers_admin_delete"
  on public.course_speakers for delete
  to authenticated
  using (private.is_admin());

-- Public bucket: speaker headshots shown on the About page and course pages.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('speaker-photos', 'speaker-photos', true, 512000, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

create policy "speaker_photo_objects_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'speaker-photos');

create policy "speaker_photo_objects_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'speaker-photos' and private.is_admin());

create policy "speaker_photo_objects_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'speaker-photos' and private.is_admin())
  with check (bucket_id = 'speaker-photos' and private.is_admin());

create policy "speaker_photo_objects_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'speaker-photos' and private.is_admin());
