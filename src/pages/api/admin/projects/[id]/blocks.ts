import type { APIRoute } from 'astro';
import { getAdminSupabase } from '../../../../../lib/supabaseServer';

const supabase = getAdminSupabase();

export const GET: APIRoute = async ({ params }) => {
  const projectId = params.id;

  if (!projectId) {
    return new Response(JSON.stringify({ error: 'Missing project id' }), { status: 400 });
  }

  const { data, error } = await supabase
    .from('projects_blocks')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true });

  if (error) {
    console.error('GET blocks error', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ blocks: data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, params }) => {
  const projectId = params.id;

  if (!projectId) {
    return new Response(JSON.stringify({ error: 'Missing project id' }), { status: 400 });
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { type, position, layout } = payload || {};
  const content = payload?.content ?? payload?.data ?? {};

  if (!type) {
    return new Response(JSON.stringify({ error: 'Missing block type' }), { status: 400 });
  }

  const finalLayout = layout || '1/1';

  // визначаємо наступну позицію, якщо не передана
  let finalPosition = position;
  if (typeof finalPosition !== 'number') {
    const { data: maxRow, error: maxError } = await supabase
      .from('projects_blocks')
      .select('position')
      .eq('project_id', projectId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxError) {
      console.error('Error fetching max position', maxError);
    }

    finalPosition = maxRow?.position != null ? maxRow.position + 1 : 0;
  }

  const { data, error } = await supabase
    .from('projects_blocks')
    .insert({
      project_id: projectId,
      type,
      content: content ?? {},
      position: finalPosition,
      layout: finalLayout,
    })
    .select('*')
    .single();

  if (error) {
    console.error('POST block error', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ block: data }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
