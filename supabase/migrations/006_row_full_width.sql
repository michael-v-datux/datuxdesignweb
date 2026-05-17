-- Optional full-bleed row on case study pages.
alter table public.projects_rows
  add column if not exists full_width boolean not null default false;
