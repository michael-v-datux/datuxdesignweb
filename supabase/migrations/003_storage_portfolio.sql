-- Portfolio media bucket (images + videos for case studies).
-- Run in Supabase SQL Editor after enabling Storage.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio',
  'portfolio',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio_public_read" on storage.objects;

create policy "portfolio_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'portfolio');

-- Uploads go through /api/admin/upload using SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
