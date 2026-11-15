alter table public.projects_rows add column if not exists presentation jsonb not null default '{}'::jsonb;
comment on column public.projects_rows.presentation is 'Case section art direction: variant, accent, label_en and label_uk; normalized by the application.';
