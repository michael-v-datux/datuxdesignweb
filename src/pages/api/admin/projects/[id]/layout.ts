import type { APIRoute } from 'astro';
import { getAdminSupabase } from '@/lib/supabaseServer';
import {
  createColumn,
  createRow,
  deleteRow,
  fetchProjectLayout,
  reorderLayout,
  updateColumnSpan,
} from '@/lib/projects/layout';
import type { BlockLayout } from '@/lib/projects/types';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const projectId = params.id;
  if (!projectId) {
    return new Response(JSON.stringify({ error: 'Missing project id' }), { status: 400 });
  }

  try {
    const layout = await fetchProjectLayout(getAdminSupabase(), projectId);
    return new Response(JSON.stringify(layout), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[layout GET]', err);
    return new Response(JSON.stringify({ error: 'Failed to load layout' }), {
      status: 500,
    });
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  const projectId = params.id;
  if (!projectId) {
    return new Response(JSON.stringify({ error: 'Missing project id' }), { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const supabase = getAdminSupabase();

  try {
    const action = body.action as string;

    if (action === 'reorder') {
      await reorderLayout(supabase, projectId, body as { rows: Array<{ id: string; columns: string[] }> });
      const layout = await fetchProjectLayout(supabase, projectId);
      return json(layout);
    }

    if (action === 'add-row') {
      const row = await createRow(supabase, projectId);
      const span = (body.span as string) || '1/1';
      const column = await createColumn(supabase, row.id, span as '1/1');
      const layout = await fetchProjectLayout(supabase, projectId);
      return json({ row, column, layout });
    }

    if (action === 'add-column') {
      const rowId = String(body.row_id || '');
      if (!rowId) return json({ error: 'row_id required' }, 400);
      const span = (body.span as string) || '1/2';
      const column = await createColumn(supabase, rowId, span as '1/1');
      const layout = await fetchProjectLayout(supabase, projectId);
      return json({ column, layout });
    }

    if (action === 'delete-row') {
      const rowId = String(body.row_id || '');
      if (!rowId) return json({ error: 'row_id required' }, 400);
      await deleteRow(supabase, projectId, rowId);
      const layout = await fetchProjectLayout(supabase, projectId);
      return json(layout);
    }

    if (action === 'update-column') {
      const columnId = String(body.column_id || '');
      const span = asSpan(body.span);
      if (!columnId) return json({ error: 'column_id required' }, 400);
      await updateColumnSpan(supabase, columnId, span);
      const layout = await fetchProjectLayout(supabase, projectId);
      return json(layout);
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (err) {
    console.error('[layout POST]', err);
    return json({ error: err instanceof Error ? err.message : 'Layout action failed' }, 500);
  }
};

function asSpan(value: unknown): BlockLayout {
  const allowed: BlockLayout[] = ['1/1', '1/2', '1/3', '1/4', 'full'];
  return allowed.includes(value as BlockLayout) ? (value as BlockLayout) : '1/1';
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
