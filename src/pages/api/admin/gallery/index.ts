import type { APIRoute } from 'astro';
import { getAdminSupabase } from '@/lib/supabaseServer';
import { deleteGalleryFile, listGalleryFiles } from '@/lib/storage/gallery';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const projectId = url.searchParams.get('projectId')?.trim() || undefined;
    const files = await listGalleryFiles(getAdminSupabase(), { projectId });
    return json({ files });
  } catch (err) {
    console.error('[gallery GET]', err);
    return json(
      { error: err instanceof Error ? err.message : 'Failed to list files' },
      500
    );
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  let body: { path?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const path = String(body.path || '').trim();
  if (!path) return json({ error: 'path required' }, 400);

  try {
    await deleteGalleryFile(getAdminSupabase(), path);
    return json({ ok: true });
  } catch (err) {
    console.error('[gallery DELETE]', err);
    return json(
      { error: err instanceof Error ? err.message : 'Failed to delete file' },
      500
    );
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
