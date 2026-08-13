-- Resources move from a single fixed audience to many free-text audiences:
-- resources.category (text, checked against the launch five) becomes
-- resources.audiences (text[], unconstrained), mirroring how courses.category
-- went free text earlier. No data is discarded — each existing value becomes
-- the single element of its resource's new array.

-- Drop whatever the inline check constraint happens to be named (found
-- dynamically so this doesn't depend on Postgres's naming convention).
do $$
declare
  con record;
begin
  for con in
    select conname from pg_constraint
    where conrelid = 'public.resources'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%category%'
  loop
    execute format('alter table public.resources drop constraint %I', con.conname);
  end loop;
end $$;

alter table public.resources rename column category to audiences;

alter table public.resources
  alter column audiences type text[]
  using (
    case
      when audiences is null or btrim(audiences) = '' then '{}'::text[]
      else array[audiences]
    end
  );

alter table public.resources alter column audiences set default '{}';
alter table public.resources alter column audiences set not null;
