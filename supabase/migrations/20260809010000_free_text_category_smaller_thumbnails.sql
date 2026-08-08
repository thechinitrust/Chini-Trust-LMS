-- Category becomes free text: admins can enter any topic, not just the
-- launch four. Drop whatever the inline check constraint on courses.category
-- happens to be named (found dynamically so this doesn't depend on Postgres's
-- default constraint-naming convention).
do $$
declare
  con record;
begin
  for con in
    select conname from pg_constraint
    where conrelid = 'public.courses'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%category%'
  loop
    execute format('alter table public.courses drop constraint %I', con.conname);
  end loop;
end $$;

-- Course banners are capped tighter: 500KB instead of 5MB.
update storage.buckets set file_size_limit = 512000 where id = 'course-thumbnails';
