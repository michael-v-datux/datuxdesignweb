-- Password verifiers and new case media never belong to the anonymous API.
create table public.project_credentials (
  project_id uuid primary key references public.projects(id) on delete cascade,
  password_hash text not null
);
alter table public.project_credentials enable row level security;
revoke all on public.project_credentials from anon, authenticated;
grant all on public.project_credentials to service_role;

insert into public.project_credentials(project_id, password_hash)
select id, password_hash from public.projects where password_hash is not null;
update public.projects set password_hash = null where password_hash is not null;

-- Existing CMS password forms continue to work; credentials are moved privately.
create function public.keep_project_credentials_private() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.password_hash is not null then
    insert into public.project_credentials(project_id,password_hash) values(new.id,new.password_hash)
    on conflict(project_id) do update set password_hash=excluded.password_hash;
    update public.projects set password_hash=null where id=new.id;
  end if;
  return new;
end;
$$;
revoke all on function public.keep_project_credentials_private() from public;
create trigger project_credentials_private after insert or update of password_hash on public.projects
for each row when (new.password_hash is not null) execute function public.keep_project_credentials_private();

alter policy public_read_blocks_of_published_projects on public.projects_blocks
using (exists(select 1 from public.projects p where p.id=projects_blocks.project_id and p.is_published and not p.is_protected));
alter policy public_read_rows_of_published_projects on public.projects_rows
using (exists(select 1 from public.projects p where p.id=projects_rows.project_id and p.is_published and not p.is_protected));
alter policy public_read_columns_of_published_projects on public.projects_columns
using (exists(select 1 from public.projects_rows r join public.projects p on p.id=r.project_id where r.id=projects_columns.row_id and p.is_published and not p.is_protected));

insert into storage.buckets(id,name,public) values('private-cases','private-cases',false)
on conflict(id) do update set public=false;
