-- =============================================================================
-- FirmFlow — wipe a previous Supabase project
--
-- Run this FIRST in the Supabase SQL Editor (once).
-- Then run supabase/firmflow.sql
--
-- What this does:
--   • Drops the old FirmFleet / FirmFlow public tables, views, functions, types
--   • Drops leftover RLS helpers and the signup trigger on auth.users
--   • Removes the demo auth users that the old seed inserted
--
-- What this does NOT do:
--   • Does not drop auth schema, storage, or extensions
--   • Does not delete your Supabase project
-- =============================================================================

set search_path = public, extensions, auth;

-- ---------- 1. Stop the old signup trigger (it wrote into public.profiles) ----------
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.my_role() cascade;

-- ---------- 2. Drop known leftover tables (old prototype) ----------
drop table if exists public.activities cascade;
drop table if exists public.deployments cascade;
drop table if exists public.device_events cascade;
drop table if exists public.devices cascade;
drop table if exists public.firmware_releases cascade;
drop table if exists public.fleet_stats cascade;
drop table if exists public.profiles cascade;
drop table if exists public.organizations cascade;

-- Current FirmFlow tables (so you can re-run firmflow.sql from a clean slate)
drop table if exists public.firmware_blobs cascade;
drop table if exists public.world_kv cascade;

-- ---------- 3. Drop anything else left in public (tables, views, routines, types) ----------
do $$
declare
  rec record;
begin
  for rec in
    select schemaname, viewname
    from pg_views
    where schemaname = 'public'
  loop
    execute format('drop view if exists %I.%I cascade', rec.schemaname, rec.viewname);
  end loop;

  for rec in
    select schemaname, matviewname
    from pg_matviews
    where schemaname = 'public'
  loop
    execute format('drop materialized view if exists %I.%I cascade', rec.schemaname, rec.matviewname);
  end loop;

  for rec in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('drop table if exists public.%I cascade', rec.tablename);
  end loop;

  for rec in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'S'
  loop
    execute format('drop sequence if exists public.%I cascade', rec.relname);
  end loop;

  for rec in
    select p.proname as name, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind in ('f', 'p', 'a')
      and not exists (
        select 1
        from pg_depend d
        join pg_extension e on e.oid = d.refobjid
        where d.objid = p.oid
          and d.deptype = 'e'
      )
  loop
    execute format('drop function if exists public.%I(%s) cascade', rec.name, rec.args);
  end loop;

  for rec in
    select t.typname
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typtype in ('e', 'c')
      and not exists (
        select 1
        from pg_depend d
        join pg_extension e on e.oid = d.refobjid
        where d.objid = t.oid
          and d.deptype = 'e'
      )
  loop
    execute format('drop type if exists public.%I cascade', rec.typname);
  end loop;
end
$$;

-- Explicit enum drops in case the loop skipped them
drop type if exists public.user_role cascade;
drop type if exists public.device_status cascade;
drop type if exists public.firmware_channel cascade;
drop type if exists public.deployment_status cascade;
drop type if exists public.board_platform cascade;

-- ---------- 4. Remove demo logins the old seed created ----------
delete from auth.identities
where user_id in (
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
)
or identity_data->>'email' in (
  'admin@firmflow.io',
  'priya.nair@firmflow.io',
  'marcus.chen@firmflow.io',
  'sofia.alvarez@firmflow.io',
  'admin@firmfleet.io',
  'priya.nair@firmfleet.io',
  'marcus.chen@firmfleet.io',
  'sofia.alvarez@firmfleet.io'
);

delete from auth.users
where id in (
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
)
or email in (
  'admin@firmflow.io',
  'priya.nair@firmflow.io',
  'marcus.chen@firmflow.io',
  'sofia.alvarez@firmflow.io',
  'admin@firmfleet.io',
  'priya.nair@firmfleet.io',
  'marcus.chen@firmfleet.io',
  'sofia.alvarez@firmfleet.io'
);

notify pgrst, 'reload schema';
