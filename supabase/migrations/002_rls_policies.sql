-- Row Level Security for portfolio tables.
-- Run after 001_projects_blocks.sql if you enabled RLS in Supabase.

alter table public.projects enable row level security;
alter table public.projects_blocks enable row level security;

-- Drop old policies if re-running (safe in dev)
drop policy if exists "public_read_published_projects" on public.projects;
drop policy if exists "public_read_blocks_of_published_projects" on public.projects_blocks;

-- Site visitors (anon key): only published projects
create policy "public_read_published_projects"
  on public.projects
  for select
  to anon, authenticated
  using (is_published = true);

-- Site visitors: blocks belonging to a published project
create policy "public_read_blocks_of_published_projects"
  on public.projects_blocks
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = projects_blocks.project_id
        and p.is_published = true
    )
  );

-- Admin writes use SUPABASE_SERVICE_ROLE_KEY on the server (bypasses RLS).
-- Do NOT add permissive insert/update/delete policies for anon.
