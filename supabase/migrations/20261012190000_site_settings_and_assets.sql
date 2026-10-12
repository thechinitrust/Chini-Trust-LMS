-- Site settings & public site-assets storage bucket
-- Stores site-wide settings such as the landing page hero image & alt text

-- 1. Public bucket for site marketing & hero assets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-assets', 'site-assets', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "site_assets_objects_select_public" on storage.objects;
create policy "site_assets_objects_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-assets');

drop policy if exists "site_assets_objects_admin_insert" on storage.objects;
create policy "site_assets_objects_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-assets' and private.is_admin());

drop policy if exists "site_assets_objects_admin_update" on storage.objects;
create policy "site_assets_objects_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-assets' and private.is_admin())
  with check (bucket_id = 'site-assets' and private.is_admin());

drop policy if exists "site_assets_objects_admin_delete" on storage.objects;
create policy "site_assets_objects_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-assets' and private.is_admin());

-- 2. site_settings key-value table
create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_select_public" on public.site_settings;
create policy "site_settings_select_public"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "site_settings_admin_insert" on public.site_settings;
create policy "site_settings_admin_insert"
  on public.site_settings for insert
  to authenticated
  with check (private.is_admin());

drop policy if exists "site_settings_admin_update" on public.site_settings;
create policy "site_settings_admin_update"
  on public.site_settings for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

drop policy if exists "site_settings_admin_delete" on public.site_settings;
create policy "site_settings_admin_delete"
  on public.site_settings for delete
  to authenticated
  using (private.is_admin());

-- Seed default hero configuration
insert into public.site_settings (key, value)
values
  ('hero_image_url', '/images/home-hero.jpg'),
  ('hero_image_alt', 'Colorful illustration of diverse human profiles representing neurodiversity')
on conflict (key) do nothing;
