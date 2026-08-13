-- Which courses appear in the homepage "Featured courses" row is now an admin
-- choice rather than "the three newest published ones".
--
-- Wrapped in an existence check so the whole migration is a no-op once the
-- column is there: the backfill below must run exactly once, or a later replay
-- would re-feature courses an admin had deliberately unfeatured.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'courses' and column_name = 'featured'
  ) then
    alter table public.courses add column featured boolean not null default false;

    -- Keep the homepage exactly as it looks today: it currently shows the
    -- newest published courses, so every published course starts out featured.
    update public.courses set featured = true where published;
  end if;
end $$;
