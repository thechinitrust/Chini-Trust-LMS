-- Private, non-exposed schema for RLS helper functions and triggers.
-- Nothing in here is reachable via the Data API (PostgREST only exposes
-- `public` by default), so these functions are safe to run as
-- SECURITY DEFINER without becoming public RPC endpoints.
create schema if not exists private;

-- USAGE only -- lets anon/authenticated *resolve* private.xxx identifiers
-- referenced from RLS policies and SECURITY INVOKER trigger functions.
-- Actual access to any specific object in this schema is still gated by
-- that object's own grants (only private.is_admin() has EXECUTE below);
-- nothing in `private` is exposed via the Data API regardless, since
-- PostgREST only serves the `public` schema.
grant usage on schema private to anon, authenticated;

-- Returns true when the currently authenticated user's profile has
-- role = 'admin'. SECURITY DEFINER so it can read `profiles` regardless of
-- the caller's RLS grants, avoiding recursive-policy evaluation when used
-- inside a policy on `profiles` itself.
-- plpgsql (not sql) so this can be created before public.profiles exists --
-- plpgsql function bodies aren't validated against the catalog until first
-- execution, unlike `language sql`, which breaks the 00 -> 10 file order.
create or replace function private.is_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  return exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
end;
$$;

-- Granted to anon too: every "published content" RLS policy is `to anon,
-- authenticated` and calls private.is_admin() as part of its USING clause
-- (e.g. `using (published or private.is_admin())`). Postgres checks EXECUTE
-- privilege on a function referenced in a policy regardless of whether OR
-- short-circuits around it, so without this grant every anonymous read of
-- published content fails with "permission denied for function is_admin".
revoke execute on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

-- Shared `updated_at` maintenance trigger for admin-editable tables.
create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Creates the `profiles` row for every new auth.users signup. Role is
-- always hardcoded to 'learner' here -- raw_user_meta_data is user-editable
-- at signup time and must never be trusted for authorization.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    'learner'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function private.handle_new_user();
