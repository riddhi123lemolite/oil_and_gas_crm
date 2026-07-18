-- =====================================================================
-- OilGas CRM — Supabase (PostgreSQL) schema
-- =====================================================================
-- Paste this whole file into the Supabase SQL Editor and click "Run".
-- Safe to run more than once.
--
-- Design note: this app has 20+ interlinked record types with nested data
-- (proposals with line items, invoices, addresses, etc.). Each record type
-- gets its own table storing the record as JSON in a `data` column, keyed by
-- `id`. This preserves every field exactly and keeps the app's features intact.
-- Any field can be promoted to a real SQL column later if you need SQL
-- reporting. Access is a shared workspace: any signed-in user can read/write.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- users = staff/profiles (login accounts live in Supabase Auth; these
-- rows hold role, name, etc., matched to a login by email).
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id         text primary key,
  email      text,
  data       jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_users_email on public.users (lower(email));

-- ---------------------------------------------------------------------
-- One table per record type. Names match the app's data collections
-- exactly (incl. camelCase "callLogs"/"auditLog") so no mapping is needed.
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'leads','customers','items','proposals','orders','invoices','payments',
    'routes','dispatches','vehicles','drivers','inventory','tasks','activities',
    'messages','channels','emails','callLogs','notifications','documents','auditLog','attendance'
  ] loop
    execute format('create table if not exists public.%I (
      id         text primary key,
      data       jsonb not null,
      created_at timestamptz not null default now()
    );', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- settings = singletons: definitions, company, permissions, seed_version
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  key        text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- Row Level Security — shared workspace: any signed-in user can do anything.
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'users','leads','customers','items','proposals','orders','invoices','payments',
    'routes','dispatches','vehicles','drivers','inventory','tasks','activities',
    'messages','channels','emails','callLogs','notifications','documents','auditLog','attendance',
    'settings'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I on public.%I;', t || '_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (true) with check (true);',
      t || '_all', t);
  end loop;
end $$;

-- =====================================================================
-- Realtime — so one user's changes appear live for everyone else.
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'users','leads','customers','items','proposals','orders','invoices','payments',
    'routes','dispatches','vehicles','drivers','inventory','tasks','activities',
    'messages','channels','emails','callLogs','notifications','documents','auditLog','attendance',
    'settings'
  ] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I;', t);
    exception
      when duplicate_object then null;  -- already added on a previous run
      when undefined_object then null;  -- publication not present (non-fatal)
    end;
  end loop;
end $$;

-- =====================================================================
-- Done. The app fills these tables with sample data automatically the
-- first time someone signs in. Next: see SETUP-SUPABASE.md.
-- =====================================================================
