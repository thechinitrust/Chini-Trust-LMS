-- Per-course certificate artwork. Until now every course rendered the same
-- hard-coded placeholder certificate. An admin can now upload artwork per
-- course; the app keeps drawing the learner name / course title / issue date /
-- certificate id on top of it, so the personalised fields stay dynamic and the
-- uploaded file is a blank form, never a finished certificate.
alter table public.courses
  add column if not exists certificate_template_url text,
  -- Whether the overlaid text renders light or dark, so it reads against
  -- either pale or dark artwork.
  add column if not exists certificate_text_tone text not null default 'light'
    check (certificate_text_tone in ('light', 'dark')),
  -- Vertical nudge (percent) to line the text block up with the blank name
  -- area of whatever artwork was uploaded. Without it, arbitrary artwork lands
  -- the name on top of its own border.
  add column if not exists certificate_text_offset smallint not null default 0
    check (certificate_text_offset between -25 and 25);

-- Public bucket, mirroring course-thumbnails: templates are blank forms shown
-- as the backdrop of a learner's certificate page, so the browser must be able
-- to load them directly. Only admins may write. 2MB (vs 500KB for thumbnails)
-- because certificate artwork is print-resolution.
-- The separate, private 'certificates' bucket is untouched -- that one is
-- reserved for the future rendered-PDF work.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('certificate-templates', 'certificate-templates', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

create policy "certificate_template_objects_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'certificate-templates');

create policy "certificate_template_objects_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'certificate-templates' and private.is_admin());

create policy "certificate_template_objects_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'certificate-templates' and private.is_admin())
  with check (bucket_id = 'certificate-templates' and private.is_admin());

create policy "certificate_template_objects_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'certificate-templates' and private.is_admin());
