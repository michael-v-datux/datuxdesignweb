import type { SupabaseClient } from '@supabase/supabase-js';
import { normalizeBlock } from './blocks';
import { groupBlocksIntoRows, layoutFraction } from './rows';
import type {
  BlockLayout,
  ProjectBlock,
  ProjectColumn,
  ProjectLayout,
  ProjectRow,
} from './types';

const ROWS_TABLE = 'projects_rows';
const COLUMNS_TABLE = 'projects_columns';
const BLOCKS_TABLE = 'projects_blocks';

function asSpan(value: unknown): BlockLayout {
  const allowed: BlockLayout[] = ['1/1', '1/2', '1/3', '1/4', 'full'];
  return allowed.includes(value as BlockLayout) ? (value as BlockLayout) : '1/1';
}

function normalizeColumn(
  row: Record<string, unknown>,
  blocks: ProjectBlock[]
): ProjectColumn {
  return {
    id: String(row.id),
    row_id: String(row.row_id),
    position: typeof row.position === 'number' ? row.position : 0,
    span: asSpan(row.span),
    blocks,
  };
}

function normalizeRow(
  row: Record<string, unknown>,
  columns: ProjectColumn[]
): ProjectRow {
  return {
    id: String(row.id),
    project_id: String(row.project_id),
    position: typeof row.position === 'number' ? row.position : 0,
    columns,
  };
}

/** Flatten layout tree to block list (for legacy helpers). */
export function flattenLayout(layout: ProjectLayout): ProjectBlock[] {
  const blocks: ProjectBlock[] = [];
  let position = 0;
  for (const row of layout.rows) {
    for (const col of row.columns) {
      for (const block of col.blocks) {
        blocks.push({
          ...block,
          column_id: col.id,
          layout: col.span,
          position: position++,
        });
      }
    }
  }
  return blocks;
}

function flatBlocksToLayout(projectId: string, blocks: ProjectBlock[]): ProjectLayout {
  const grouped = groupBlocksIntoRows(blocks);
  const rows: ProjectRow[] = grouped.map((rowBlocks, rowIndex) => {
    const rowId = crypto.randomUUID();
    const columns: ProjectColumn[] = rowBlocks.map((block, colIndex) => {
      const columnId = crypto.randomUUID();
      return {
        id: columnId,
        row_id: rowId,
        position: colIndex,
        span: block.layout,
        blocks: [
          {
            ...block,
            column_id: columnId,
            project_id: projectId,
            layout: '1/1',
            position: 0,
          },
        ],
      };
    });
    return {
      id: rowId,
      project_id: projectId,
      position: rowIndex,
      columns,
    };
  });
  return { projectId, rows };
}

async function persistLayout(
  supabase: SupabaseClient,
  layout: ProjectLayout
): Promise<void> {
  const projectId = layout.projectId;

  for (const row of layout.rows) {
    const { error: rowErr } = await supabase.from(ROWS_TABLE).insert({
      id: row.id,
      project_id: projectId,
      position: row.position,
    });
    if (rowErr) throw rowErr;

    for (const col of row.columns) {
      const { error: colErr } = await supabase.from(COLUMNS_TABLE).insert({
        id: col.id,
        row_id: row.id,
        position: col.position,
        span: col.span,
      });
      if (colErr) throw colErr;

      for (const block of col.blocks) {
        const { error: blockErr } = await supabase
          .from(BLOCKS_TABLE)
          .update({
            column_id: col.id,
            layout: '1/1',
            position: block.position,
            updated_at: new Date().toISOString(),
          })
          .eq('id', block.id)
          .eq('project_id', projectId);
        if (blockErr) throw blockErr;
      }
    }
  }
}

async function fetchFlatBlocks(
  supabase: SupabaseClient,
  projectId: string
): Promise<ProjectBlock[]> {
  const { data, error } = await supabase
    .from(BLOCKS_TABLE)
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => normalizeBlock(row as Record<string, unknown>));
}

async function assembleLayout(
  supabase: SupabaseClient,
  projectId: string
): Promise<ProjectLayout | null> {
  const { data: rows, error: rowsErr } = await supabase
    .from(ROWS_TABLE)
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true });

  if (rowsErr) throw rowsErr;
  if (!rows?.length) return null;

  const rowIds = rows.map((r) => r.id);
  const { data: columns, error: colsErr } = await supabase
    .from(COLUMNS_TABLE)
    .select('*')
    .in('row_id', rowIds)
    .order('position', { ascending: true });

  if (colsErr) throw colsErr;

  const columnIds = (columns ?? []).map((c) => c.id);
  let blocks: ProjectBlock[] = [];
  if (columnIds.length > 0) {
    const { data: blocksData, error: blocksErr } = await supabase
      .from(BLOCKS_TABLE)
      .select('*')
      .in('column_id', columnIds)
      .order('position', { ascending: true });
    if (blocksErr) throw blocksErr;
    blocks = (blocksData ?? []).map((row) =>
      normalizeBlock(row as Record<string, unknown>)
    );
  }

  const blocksByColumn = new Map<string, ProjectBlock[]>();
  for (const block of blocks) {
    if (!block.column_id) continue;
    const list = blocksByColumn.get(block.column_id) ?? [];
    list.push(block);
    blocksByColumn.set(block.column_id, list);
  }

  const columnsByRow = new Map<string, ProjectColumn[]>();
  for (const col of columns ?? []) {
    const colBlocks = blocksByColumn.get(col.id) ?? [];
    const normalized = normalizeColumn(col as Record<string, unknown>, colBlocks);
    const list = columnsByRow.get(col.row_id) ?? [];
    list.push(normalized);
    columnsByRow.set(col.row_id, list);
  }

  const layoutRows: ProjectRow[] = rows.map((row) =>
    normalizeRow(row as Record<string, unknown>, columnsByRow.get(row.id) ?? [])
  );

  return { projectId, rows: layoutRows };
}

/** Read layout only (no migration). Safe for public anon client. */
export async function fetchProjectLayoutReadonly(
  supabase: SupabaseClient,
  projectId: string
): Promise<ProjectLayout> {
  const existing = await assembleLayout(supabase, projectId);
  return existing ?? { projectId, rows: [] };
}

/**
 * Load layout; migrates legacy flat blocks on first access (admin / service role).
 */
export async function fetchProjectLayout(
  supabase: SupabaseClient,
  projectId: string
): Promise<ProjectLayout> {
  const existing = await assembleLayout(supabase, projectId);
  if (existing) return existing;

  const flat = await fetchFlatBlocks(supabase, projectId);
  if (!flat.length) return { projectId, rows: [] };

  const layout = flatBlocksToLayout(projectId, flat);
  await persistLayout(supabase, layout);
  return layout;
}

export async function createRow(
  supabase: SupabaseClient,
  projectId: string,
  position?: number
): Promise<ProjectRow> {
  let pos = position;
  if (typeof pos !== 'number') {
    const { data: max } = await supabase
      .from(ROWS_TABLE)
      .select('position')
      .eq('project_id', projectId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();
    pos = max?.position != null ? max.position + 1 : 0;
  }

  const id = crypto.randomUUID();
  const { error } = await supabase.from(ROWS_TABLE).insert({
    id,
    project_id: projectId,
    position: pos,
  });
  if (error) throw error;
  return { id, project_id: projectId, position: pos, columns: [] };
}

export async function createColumn(
  supabase: SupabaseClient,
  rowId: string,
  span: BlockLayout = '1/1',
  position?: number
): Promise<ProjectColumn> {
  let pos = position;
  if (typeof pos !== 'number') {
    const { data: max } = await supabase
      .from(COLUMNS_TABLE)
      .select('position')
      .eq('row_id', rowId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();
    pos = max?.position != null ? max.position + 1 : 0;
  }

  const id = crypto.randomUUID();
  const { error } = await supabase.from(COLUMNS_TABLE).insert({
    id,
    row_id: rowId,
    position: pos,
    span,
  });
  if (error) throw error;
  return { id, row_id: rowId, position: pos, span, blocks: [] };
}

/** Reorder rows and columns; payload: { rows: [{ id, columns: [columnId, ...] }] } */
export async function reorderLayout(
  supabase: SupabaseClient,
  projectId: string,
  payload: { rows: Array<{ id: string; columns: string[] }> }
): Promise<void> {
  for (let rowIndex = 0; rowIndex < payload.rows.length; rowIndex++) {
    const row = payload.rows[rowIndex];
    await supabase
      .from(ROWS_TABLE)
      .update({ position: rowIndex, updated_at: new Date().toISOString() })
      .eq('id', row.id)
      .eq('project_id', projectId);

    for (let colIndex = 0; colIndex < row.columns.length; colIndex++) {
      const colId = row.columns[colIndex];
      await supabase
        .from(COLUMNS_TABLE)
        .update({ position: colIndex, updated_at: new Date().toISOString() })
        .eq('id', colId)
        .eq('row_id', row.id);
    }
  }
}

export async function deleteRow(
  supabase: SupabaseClient,
  projectId: string,
  rowId: string
): Promise<void> {
  const { error } = await supabase
    .from(ROWS_TABLE)
    .delete()
    .eq('id', rowId)
    .eq('project_id', projectId);
  if (error) throw error;
}

export async function deleteColumn(
  supabase: SupabaseClient,
  rowId: string,
  columnId: string
): Promise<void> {
  const { error } = await supabase
    .from(COLUMNS_TABLE)
    .delete()
    .eq('id', columnId)
    .eq('row_id', rowId);
  if (error) throw error;
}

export async function updateColumnSpan(
  supabase: SupabaseClient,
  columnId: string,
  span: BlockLayout
): Promise<void> {
  const { error } = await supabase
    .from(COLUMNS_TABLE)
    .update({ span, updated_at: new Date().toISOString() })
    .eq('id', columnId);
  if (error) throw error;
}

export function layoutColumnWidth(span: BlockLayout): string {
  const fraction = layoutFraction(span);
  if (fraction >= 1) return '100%';
  return `${(fraction * 100).toFixed(3)}%`;
}
