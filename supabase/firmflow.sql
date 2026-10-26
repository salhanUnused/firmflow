-- =============================================================================
-- FirmFlow — create all tables
--
-- Paste this entire file into the Supabase SQL Editor and run it.
-- Run supabase/reset-previous-project.sql first if this project already
-- has leftover tables from the earlier prototype.
--
-- This is the full schema the website uses. Workspaces, users, projects,
-- devices, firmware metadata, deployments, telemetry, logs, alerts and
-- audit events are stored as JSON in world_kv. Firmware binaries are
-- stored in firmware_blobs. The Next.js server reads/writes both with
-- the service role key. The browser never talks to these tables.
-- =============================================================================

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

comment on table public.world_kv is
  'Singleton JSON document (key = world) for orgs, users, projects, devices, firmware, deployments, telemetry, logs, alerts, audit.';

comment on table public.firmware_blobs is
  'Firmware binaries as base64, keyed by blob id from a firmware release.';

create index if not exists world_kv_updated_at_idx
  on public.world_kv (updated_at desc);

create index if not exists firmware_blobs_updated_at_idx
  on public.firmware_blobs (updated_at desc);

alter table public.world_kv enable row level security;
alter table public.firmware_blobs enable row level security;

revoke all on public.world_kv from anon, authenticated;
revoke all on public.firmware_blobs from anon, authenticated;

grant usage on schema public to service_role;
grant all on public.world_kv to service_role;
grant all on public.firmware_blobs to service_role;

notify pgrst, 'reload schema';
