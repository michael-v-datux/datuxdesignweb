import type { APIRoute } from 'astro';
import supabase from '../../../../../lib/supabaseClient';

export const PATCH: APIRoute = async ({ params, request }) => {
  const projectId = params.id;
  const blockId = params.blockId;

  if (!projectId || !blockId) {
    return new Response(JSON.stringify({ error: 'Missing ids' }), { status: 400 });
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const update: Record<string, any> = {};
  if (payload.type) update.type = payload.type;
  if (payload.content !== undefined) update.content = payload.content;
  else if (payload.data !== undefined) update.content = payload.data;
  if (typeof payload.position === 'number') update.position = payload.position;
  if (payload.layout) update.layout = payload.layout;

  if (Object.keys(update).length === 0) {
    return new Response(JSON.stringify({ error: 'Nothing to update' }), {
      status: 400,
    });
  }

  update.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('projects_blocks')
    .update(update)
    .eq('id', blockId)
    .eq('project_id', projectId)
    .select('*')
    .single();

  if (error) {
    console.error('PATCH block error', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ block: data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params }) => {
  const projectId = params.id;
  const blockId = params.blockId;

  if (!projectId || !blockId) {
    return new Response(JSON.stringify({ error: 'Missing ids' }), { status: 400 });
  }

  const { error } = await supabase
    .from('projects_blocks')
    .delete()
    .eq('id', blockId)
    .eq('project_id', projectId);

  if (error) {
    console.error('DELETE block error', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
