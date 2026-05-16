import type { APIRoute } from 'astro';
import { getAdminSupabase } from '@/lib/supabaseServer';
import {
  PORTFOLIO_BUCKET,
  buildStoragePath,
  isAllowedMime,
  maxBytesForMime,
} from '@/lib/storage/portfolio';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const form = await request.formData();
    const file = form.get('file');
    const projectId = String(form.get('projectId') ?? '').trim();

    if (!(file instanceof File) || !projectId) {
      return new Response(JSON.stringify({ error: 'Missing file or projectId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!isAllowedMime(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Unsupported file type. Use JPG, PNG, WebP, GIF, SVG, MP4, or WebM.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const maxBytes = maxBytesForMime(file.type);
    if (file.size > maxBytes) {
      const mb = Math.round(maxBytes / (1024 * 1024));
      return new Response(
        JSON.stringify({ error: `File too large (max ${mb} MB for this type).` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const path = buildStoragePath(projectId, file.type);
    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = getAdminSupabase();

    const { error } = await supabase.storage.from(PORTFOLIO_BUCKET).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error('[upload]', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: publicData } = supabase.storage.from(PORTFOLIO_BUCKET).getPublicUrl(path);

    return new Response(
      JSON.stringify({ url: publicData.publicUrl, path }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[upload]', err);
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
