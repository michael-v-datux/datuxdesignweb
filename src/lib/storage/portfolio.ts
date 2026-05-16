export const PORTFOLIO_BUCKET = 'portfolio';

export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const;

export const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm'] as const;

export const ALLOWED_MIME_TYPES = [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES];

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export function isAllowedMime(type: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(type);
}

export function maxBytesForMime(type: string): number {
  return (VIDEO_MIME_TYPES as readonly string[]).includes(type)
    ? MAX_VIDEO_BYTES
    : MAX_IMAGE_BYTES;
}

export function extensionForMime(type: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
  };
  return map[type] ?? 'bin';
}

export function buildStoragePath(projectId: string, mime: string): string {
  const ext = extensionForMime(mime);
  const id = crypto.randomUUID().slice(0, 8);
  return `${projectId}/${Date.now()}-${id}.${ext}`;
}
