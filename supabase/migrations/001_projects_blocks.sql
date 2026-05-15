-- Canonical schema for Behance-style portfolio blocks.
-- Run in Supabase SQL Editor if tables/columns are missing.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_en text,
  title_uk text,
  description_en text,
  description_uk text,
  content_en text,
  content_uk text,
  thumbnail_url text,
  cover_url text,
  category_en text,
  category_uk text,
  status text default 'draft',
  is_published boolean default false,
  is_protected boolean default false,
  password_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.projects_blocks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  type text not null default 'text',
  content jsonb not null default '{}'::jsonb,
  position integer not null default 0,
  layout text not null default '1/1',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists projects_blocks_project_id_position_idx
  on public.projects_blocks (project_id, position);

-- Optional: migrate legacy `data` / `order` columns if they exist
-- alter table public.projects_blocks rename column "data" to content;
-- alter table public.projects_blocks rename column "order" to position;
