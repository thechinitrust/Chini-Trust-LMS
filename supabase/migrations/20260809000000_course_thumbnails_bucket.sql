-- Public bucket: course banners are marketing images shown on the catalogue
-- and course pages, so anyone may read them. Only admins may write.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('course-thumbnails', 'course-thumbnails', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "course_thumbnail_objects_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'course-thumbnails');

create policy "course_thumbnail_objects_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'course-thumbnails' and private.is_admin());

create policy "course_thumbnail_objects_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'course-thumbnails' and private.is_admin())
  with check (bucket_id = 'course-thumbnails' and private.is_admin());

create policy "course_thumbnail_objects_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'course-thumbnails' and private.is_admin());
