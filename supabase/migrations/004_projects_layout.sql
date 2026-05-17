-- Row / column layout for portfolio case studies (WPBakery-style structure).
-- Run in Supabase SQL Editor after 001–003.

create table if not exists public.projects_rows (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.projects_columns (
  id uuid primary key default gen_random_uuid(),
  row_id uuid not null references public.projects_rows(id) on delete cascade,
  position integer not null default 0,
  span text not null default '1/1',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects_blocks
  add column if not exists column_id uuid references public.projects_columns(id) on delete cascade;

create index if not exists projects_rows_project_id_position_idx
  on public.projects_rows (project_id, position);

create index if not exists projects_columns_row_id_position_idx
  on public.projects_columns (row_id, position);

create index if not exists projects_blocks_column_id_position_idx
  on public.projects_blocks (column_id, position);
