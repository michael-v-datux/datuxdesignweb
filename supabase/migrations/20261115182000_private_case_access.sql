-- Private media and content for the Proximity case only. Existing case access is unchanged.
create table public.project_credentials (
  project_id uuid primary key references public.projects(id) on delete cascade,
  password_hash text not null
);
alter table public.project_credentials enable row level security;
revoke all on public.project_credentials from anon, authenticated;
grant all on public.project_credentials to service_role;

alter table public.projects add column private_materials boolean not null default false;
update public.projects set private_materials=true, is_protected=true where slug='design-system';

-- Only Proximity has private_materials=true. All other projects retain their existing policies.
alter policy public_read_blocks_of_published_projects on public.projects_blocks
using (exists(select 1 from public.projects p where p.id=projects_blocks.project_id and p.is_published and not p.private_materials));
alter policy public_read_rows_of_published_projects on public.projects_rows
using (exists(select 1 from public.projects p where p.id=projects_rows.project_id and p.is_published and not p.private_materials));
alter policy public_read_columns_of_published_projects on public.projects_columns
using (exists(select 1 from public.projects_rows r join public.projects p on p.id=r.project_id where r.id=projects_columns.row_id and p.is_published and not p.private_materials));

insert into storage.buckets(id,name,public) values('private-cases','private-cases',false)
on conflict(id) do update set public=false;
