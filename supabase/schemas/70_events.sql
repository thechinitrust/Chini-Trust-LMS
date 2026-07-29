-- Standalone calendar events (webinars, deadlines, live Q&A, announcements)
-- shown on the dashboard's "Upcoming" widget. RLS mirrors courses exactly.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  link_url text,
  category text not null default 'announcement'
    check (category in ('webinar', 'deadline', 'live-qa', 'announcement')),
  published boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_starts_at_idx on public.events (starts_at);
create index events_created_by_idx on public.events (created_by);

create trigger set_events_updated_at
  before update on public.events
  for each row
  execute function private.set_updated_at();

alter table public.events enable row level security;

create policy "events_select_published_or_admin"
  on public.events for select
  to anon, authenticated
  using (published or private.is_admin());

create policy "events_admin_insert"
  on public.events for insert
  to authenticated
  with check (private.is_admin());

create policy "events_admin_update"
  on public.events for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "events_admin_delete"
  on public.events for delete
  to authenticated
  using (private.is_admin());
