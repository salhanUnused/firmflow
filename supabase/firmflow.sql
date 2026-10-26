-- FirmFlow persistence for Vercel.
-- Run in the Supabase SQL editor. The Next.js server uses the service role
-- and never exposes this table to the browser.

create table if not exists public.world_kv (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.firmware_blobs (
  id text primary key,
  bytes text not null,
  updated_at timestamptz not null default now()
);

alter table public.world_kv enable row level security;
alter table public.firmware_blobs enable row level security;

-- No anon/authenticated policies: only the service role (which bypasses RLS)
-- can read or write. Browser clients talk to Next.js API routes instead.

grant usage on schema public to service_role;
grant all on public.world_kv to service_role;
grant all on public.firmware_blobs to service_role;
