import type { APIRoute } from 'astro';
import { matchesProjectPassword, projectPasswordHash, verifyProjectToken, requestProjectToken } from '@/lib/projects/access';
import { getServerSupabase } from '@/lib/supabaseServer';
const supabase = getServerSupabase();
import { fetchProjectBlocks, parseLegacySections } from '@/lib/projects/blocks';

export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  const { key } = await request.json().catch(() => ({}));

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !project) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  if (project.is_protected) {
    const hash = await projectPasswordHash(project);
    const match = verifyProjectToken(requestProjectToken(request, slug!), slug!, hash) || await matchesProjectPassword(key, hash);
    if (!match) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
  }

  const blocks = await fetchProjectBlocks(String(project.id), supabase);
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
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', Vary: 'Cookie' },
    }
  );
};
