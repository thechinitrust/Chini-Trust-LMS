create table public.accessibility_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  dark_mode boolean not null default false,
  dyslexia_font boolean not null default false,
  text_scale text not null default 'default' check (text_scale in ('default', 'lg', 'xl')),
  focus_mode boolean not null default false,
  read_aloud boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.accessibility_preferences enable row level security;

create trigger set_accessibility_preferences_updated_at
  before update on public.accessibility_preferences
  for each row
  execute function private.set_updated_at();

create policy "accessibility_preferences_select_own_or_admin"
  on public.accessibility_preferences for select
  to authenticated
  using ((select auth.uid()) = user_id or private.is_admin());

create policy "accessibility_preferences_owner_insert"
  on public.accessibility_preferences for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "accessibility_preferences_owner_update"
  on public.accessibility_preferences for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
