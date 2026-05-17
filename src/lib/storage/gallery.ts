import type { SupabaseClient } from '@supabase/supabase-js';
import { PORTFOLIO_BUCKET } from './portfolio';

export interface GalleryFile {
  path: string;
  name: string;
  projectId: string;
  url: string;
  size: number | null;
  mime: string | null;
  createdAt: string | null;
  isVideo: boolean;
}

function publicUrl(supabase: SupabaseClient, path: string): string {
  const { data } = supabase.storage.from(PORTFOLIO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function isFileEntry(entry: { id?: string | null; name: string }): boolean {
  return Boolean(entry.id);
}

/** List media files for one project folder or entire bucket. */
export async function listGalleryFiles(
  supabase: SupabaseClient,
  options: { projectId?: string; limit?: number } = {}
): Promise<GalleryFile[]> {
  const limit = options.limit ?? 500;
  const files: GalleryFile[] = [];

  const prefixes: string[] = [];
  if (options.projectId) {
    prefixes.push(options.projectId);
  } else {
    const { data: roots, error } = await supabase.storage.from(PORTFOLIO_BUCKET).list('', {
      limit: 200,
    });
    if (error) throw error;
    for (const entry of roots ?? []) {
      if (!isFileEntry(entry)) prefixes.push(entry.name);
    }
  }

  for (const prefix of prefixes) {
    const { data: entries, error } = await supabase.storage.from(PORTFOLIO_BUCKET).list(prefix, {
      limit,
      sortBy: { column: 'created_at', order: 'desc' },
    });
    if (error) throw error;

    for (const entry of entries ?? []) {
      if (!isFileEntry(entry)) continue;
      const path = `${prefix}/${entry.name}`;
      const meta = entry.metadata as { size?: number; mimetype?: string } | undefined;
      const mime = meta?.mimetype ?? null;
      files.push({
        path,
        name: entry.name,
        projectId: prefix,
        url: publicUrl(supabase, path),
        size: meta?.size ?? null,
        mime,
        createdAt: entry.created_at ?? null,
        isVideo: Boolean(mime?.startsWith('video/')),
      });
    }
  }

  files.sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
    return tb - ta;
  });

  return files.slice(0, limit);
}

export async function deleteGalleryFile(
  supabase: SupabaseClient,
  path: string
): Promise<void> {
  const normalized = path.replace(/^\/+/, '');
  if (!normalized || normalized.includes('..')) {
    throw new Error('Invalid path');
  }
  const { error } = await supabase.storage.from(PORTFOLIO_BUCKET).remove([normalized]);
  if (error) throw error;
}
