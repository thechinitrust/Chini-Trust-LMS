-- Add published status to resources, matching the course publishing system.
-- Existing resources default to published = true so no content disappears.

alter table public.resources
  add column if not exists published boolean not null default true;

-- Update the select RLS policy so non-admins only see published resources.
drop policy if exists "resources_select_public_or_published_or_admin" on public.resources;

create policy "resources_select_public_or_published_or_admin"
  on public.resources for select
  to anon, authenticated
  using (
    private.is_admin()
    or (
      published
      and (
        course_id is null
        or exists (
          select 1 from public.courses c
          where c.id = resources.course_id and c.published
        )
      )
    )
  );
