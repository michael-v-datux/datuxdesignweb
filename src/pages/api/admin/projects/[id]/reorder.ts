import type { APIRoute } from 'astro';
import { getAdminSupabase } from '../../../../../lib/supabaseServer';

const supabase = getAdminSupabase();

export const POST: APIRoute = async ({ params, request }) => {
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

  const order: string[] = payload?.order;
  if (!Array.isArray(order) || order.length === 0) {
    return new Response(JSON.stringify({ error: 'Invalid order payload' }), {
      status: 400,
    });
  }

  // оновлюємо position по черзі
  for (let index = 0; index < order.length; index++) {
    const blockId = order[index];
    const { error } = await supabase
      .from('projects_blocks')
      .update({ position: index, updated_at: new Date().toISOString() })
      .eq('id', blockId)
      .eq('project_id', projectId);

    if (error) {
      console.error('Reorder error at', blockId, error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
