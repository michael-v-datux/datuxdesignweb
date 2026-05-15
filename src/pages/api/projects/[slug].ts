import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabaseClient';
import { fetchProjectBlocks, parseLegacySections } from '@/lib/projects/blocks';

export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  const { key } = await request.json();

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !project) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  if (project.is_protected) {
    const match = await bcrypt.compare(key, project.password_hash);
    if (!match) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
  }

  const blocks = await fetchProjectBlocks(String(project.id));
  const sections =
    blocks.length > 0
      ? []
      : parseLegacySections(project.content_en).length
        ? parseLegacySections(project.content_en)
        : [];

  return new Response(
    JSON.stringify({
      title: project.title_en,
      subtitle: project.description_en,
      sections,
      blocks,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
