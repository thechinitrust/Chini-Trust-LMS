create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  role text not null default 'learner' check (role in ('learner', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per auth.users signup, created by private.handle_new_user(). '
  'role is app-level RBAC and must never be set from client-supplied '
  'auth metadata -- see private.handle_new_user() and the role-guard trigger below.';

alter table public.profiles enable row level security;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function private.set_updated_at();

-- Blocks role self-escalation: a row's `role` can only change when the
-- caller is already an admin (checked via private.is_admin(), not the row
-- being modified), regardless of what the UPDATE's WITH CHECK allows.
create or replace function private.guard_profile_role_change()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- (select auth.uid()) is null for connections that aren't an end-user
  -- PostgREST session (the SQL editor, migrations, the service_role key) --
  -- those are trusted operator access and must be able to bootstrap the
  -- first admin. Only sessions authenticated as a specific end user (where
  -- auth.uid() is set) are held to the private.is_admin() check.
  if new.role is distinct from old.role
     and (select auth.uid()) is not null
     and not private.is_admin() then
    raise exception 'only admins may change profile role';
  end if;
  return new;
end;
$$;

create trigger guard_profile_role_change
  before update on public.profiles
  for each row
  execute function private.guard_profile_role_change();

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id or private.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id or private.is_admin())
  with check ((select auth.uid()) = id or private.is_admin());

-- No insert/delete policies: rows are created by private.handle_new_user()
-- (SECURITY DEFINER, bypasses RLS as table owner) and deleted via
-- `on delete cascade` from auth.users. Nothing else should insert/delete here.
