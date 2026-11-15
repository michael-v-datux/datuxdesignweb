alter table public.projects add column if not exists case_theme text not null default 'classic' check (case_theme in ('classic', 'fluid'));
comment on column public.projects.case_theme is 'Visual language of the case hero and typography; section compositions remain independent.';
