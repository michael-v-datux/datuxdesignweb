import type { APIRoute } from 'astro';
import { getAdminSupabase } from '../../../../../lib/supabaseServer';
import { createColumn, createRow } from '../../../../../lib/projects/layout';
import type { BlockLayout } from '../../../../../lib/projects/types';

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

  const span = (layout || '1/1') as BlockLayout;
  let columnId = payload?.column_id ? String(payload.column_id) : null;

  if (!columnId) {
    const row = await createRow(supabase, projectId);
    const column = await createColumn(supabase, row.id, span);
    columnId = column.id;
  }

  let finalPosition = position;
  if (typeof finalPosition !== 'number') {
    const { data: maxRow } = await supabase
      .from('projects_blocks')
      .select('position')
      .eq('column_id', columnId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();
    finalPosition = maxRow?.position != null ? maxRow.position + 1 : 0;
  }

  const { data, error } = await supabase
    .from('projects_blocks')
    .insert({
      project_id: projectId,
      type,
      content: content ?? {},
      position: finalPosition,
      layout: '1/1',
      column_id: columnId,
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
