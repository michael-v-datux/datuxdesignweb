import { supabase } from '@/lib/supabaseClient';
import type {
  BlockContent,
  BlockLayout,
  BlockType,
  LegacySection,
  ProjectBlock,
} from './types';

const BLOCKS_TABLE = 'projects_blocks';

function asLayout(value: unknown): BlockLayout {
  const allowed: BlockLayout[] = ['1/1', '1/2', '1/3', '1/4', 'full'];
  return allowed.includes(value as BlockLayout) ? (value as BlockLayout) : '1/1';
}

function asType(value: unknown): BlockType {
  if (value === 'image' || value === 'media') return value;
  return 'text';
}

/** Normalize DB row (handles legacy `data` / `order` column names). */
export function normalizeBlock(row: Record<string, unknown>): ProjectBlock {
  const rawContent = (row.content ?? row.data ?? {}) as BlockContent;
  const position =
    typeof row.position === 'number'
      ? row.position
      : typeof row.order === 'number'
        ? row.order
        : 0;

  return {
    id: String(row.id),
    project_id: String(row.project_id),
    type: asType(row.type),
    content: rawContent,
    position,
    layout: asLayout(row.layout),
  };
}

export async function fetchProjectBlocks(projectId: string): Promise<ProjectBlock[]> {
  const { data, error } = await supabase
    .from(BLOCKS_TABLE)
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true });

  if (error) {
    console.error('[fetchProjectBlocks]', error.message);
    return [];
  }

  return (data ?? []).map((row) => normalizeBlock(row as Record<string, unknown>));
}

export function blockText(content: BlockContent, lang: string): string {
  if (lang === 'uk' && content.text_uk) return content.text_uk;
  if (lang === 'en' && content.text_en) return content.text_en;
  if (content.text) return content.text;
  const col = content.columns?.[0]?.text;
  if (col) return (lang === 'uk' ? col.uk : col.en) || col.en || col.uk || '';
  return '';
}

function mapLegacyLayout(layout?: string): BlockLayout {
  if (layout === 'full') return 'full';
  if (layout === 'side-by-side') return '1/2';
  return '1/1';
}

/** Convert old `content_*.sections` JSON into blocks for unified rendering. */
export function legacySectionsToBlocks(sections: LegacySection[]): ProjectBlock[] {
  const blocks: ProjectBlock[] = [];
  let position = 0;

  for (const section of sections) {
    const layout = mapLegacyLayout(section.layout);

    if (section.description?.trim()) {
      blocks.push({
        id: `legacy-text-${position}`,
        project_id: 'legacy',
        type: 'text',
        content: { text: section.description },
        position: position++,
        layout,
      });
    }

    for (const img of section.images ?? []) {
      if (!img.src) continue;
      blocks.push({
        id: `legacy-img-${position}`,
        project_id: 'legacy',
        type: 'image',
        content: { url: img.src, alt: img.alt ?? '' },
        position: position++,
        layout,
      });
    }
  }

  return blocks;
}

export function parseLegacySections(raw: string | null | undefined): LegacySection[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.sections) ? parsed.sections : [];
  } catch {
    return [];
  }
}

export async function resolveProjectBlocks(
  projectId: string,
  lang: string,
  contentEn?: string | null,
  contentUk?: string | null
): Promise<ProjectBlock[]> {
  const fromDb = await fetchProjectBlocks(projectId);
  if (fromDb.length > 0) return fromDb;

  const raw = lang === 'uk' ? contentUk || contentEn : contentEn || contentUk;
  return legacySectionsToBlocks(parseLegacySections(raw));
}
