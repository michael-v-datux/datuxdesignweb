import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchProjectLayout } from './layout';
import { makeSectionTemplate, normalizePresentation, duplicateBlockRows } from '../../../public/scripts/lib/case-design.js';

export async function applySectionAction(supabase: SupabaseClient, projectId: string, body: Record<string, unknown>) {
  if (body.action === 'update-presentation') {
    const { data, error } = await supabase.from('projects_rows')
      .update({ presentation: normalizePresentation(body.presentation), updated_at: new Date().toISOString() })
      .eq('id', String(body.row_id || '')).eq('project_id', projectId).select('id').single();
    if (error || !data) throw error || new Error('Section not found');
  } else if (body.action === 'duplicate-block') {
    const { data: source, error } = await supabase.from('projects_blocks').select('*')
      .eq('id', String(body.block_id || '')).eq('project_id', projectId).single();
    if (error || !source?.column_id) throw error || new Error('Block not found');
    const { data: siblings, error: readError } = await supabase.from('projects_blocks').select('*')
      .eq('column_id', source.column_id).eq('project_id', projectId).order('position');
    if (readError) throw readError;
    const batch = duplicateBlockRows(siblings || [], source.id, crypto.randomUUID(), new Date().toISOString());
    const { error: writeError } = await supabase.from('projects_blocks').upsert(batch, { onConflict: 'id' });
    if (writeError) throw writeError;
  } else if (body.action === 'add-template') {
    const template = makeSectionTemplate(String(body.template_id || ''));
    const { data: last, error: lastError } = await supabase.from('projects_rows').select('position')
      .eq('project_id', projectId).order('position', { ascending: false }).limit(1).maybeSingle();
    if (lastError) throw lastError;
    const rowId = crypto.randomUUID();
    const { error: rowError } = await supabase.from('projects_rows').insert({
      id: rowId, project_id: projectId, position: (last?.position ?? -1) + 1, full_width: false, presentation: template.presentation,
    });
    if (rowError) throw rowError;
    try {
      const columns = template.columns.map((column: any, position: number) => ({ id: crypto.randomUUID(), row_id: rowId, position, span: column.span }));
      const { error: columnError } = await supabase.from('projects_columns').insert(columns);
      if (columnError) throw columnError;
      const blocks = template.columns.flatMap((column: any, i: number) => column.blocks.map((block: any, position: number) => ({
        id: crypto.randomUUID(), project_id: projectId, column_id: columns[i].id, position, layout: '1/1', type: block.type, content: block.content,
      })));
      const { error: blockError } = await supabase.from('projects_blocks').insert(blocks);
      if (blockError) throw blockError;
    } catch (error) {
      // Foreign keys cascade, so a failed template leaves no half-created section.
      const { error: cleanupError } = await supabase.from('projects_rows').delete().eq('id', rowId).eq('project_id', projectId);
      if (cleanupError) console.error('[template cleanup]', cleanupError);
      throw error;
    }
  } else throw new Error('Unknown section action');
  return fetchProjectLayout(supabase, projectId);
}
