-- RLS for layout tables (public read when project is published).

alter table public.projects_rows enable row level security;
alter table public.projects_columns enable row level security;

drop policy if exists "public_read_rows_of_published_projects" on public.projects_rows;
drop policy if exists "public_read_columns_of_published_projects" on public.projects_columns;

create policy "public_read_rows_of_published_projects"
  on public.projects_rows
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = projects_rows.project_id and p.is_published = true
    )
  );

create policy "public_read_columns_of_published_projects"
  on public.projects_columns
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.projects_rows r
      join public.projects p on p.id = r.project_id
      where r.id = projects_columns.row_id and p.is_published = true
    )
  );

-- blocks policy already checks project_id; column-linked blocks still have project_id set.
