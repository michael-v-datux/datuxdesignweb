alter table public.projects drop constraint projects_case_theme_check;
alter table public.projects add constraint projects_case_theme_check check (case_theme in ('classic','fluid','playful','journal','dialogue','system','workbench'));
