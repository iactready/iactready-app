-- iActReady — initial production schema
-- Targets Supabase managed Postgres (pgvector preinstalled, auth schema ready).
-- This is the MVP slice: waitlist + extensions. Full AI Act schema lives in /db/migrations/001_init.sql
-- and will be applied when the inventory wizard / docs modules are wired in.

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- =========================
-- Waitlist (landing capture)
-- =========================
create table if not exists public.waitlist (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  ip              inet,
  user_agent      text,
  source          text not null default 'landing',
  utm             jsonb,
  contacted_at    timestamptz,
  notes           text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_waitlist_created on public.waitlist (created_at desc);
create index if not exists idx_waitlist_source on public.waitlist (source);

-- RLS: lock down. Only the service_role (via /api/waitlist) can write.
alter table public.waitlist enable row level security;

-- No public select policy. Only service_role bypasses RLS, so the table is effectively private.
-- Drop and recreate if exists to keep this script idempotent.
drop policy if exists "noone selects waitlist" on public.waitlist;
drop policy if exists "noone inserts via anon" on public.waitlist;

-- Explicit deny for anon / authenticated. Service role bypasses RLS so it can still insert.
create policy "noone selects waitlist"
  on public.waitlist for select to anon, authenticated
  using (false);

create policy "noone inserts via anon"
  on public.waitlist for insert to anon, authenticated
  with check (false);

-- =========================
-- Comment / audit notes
-- =========================
comment on table public.waitlist is
  'Email captures from iactready.com landing. Inserted by /api/waitlist (Next.js) via service_role, never directly by the browser.';
