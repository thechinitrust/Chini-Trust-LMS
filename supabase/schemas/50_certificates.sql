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
