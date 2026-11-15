/** Resolve one HTTP byte range. null means no range; false means unsatisfiable. */
export function mediaRange(header: string | null, size: number): { start: number; end: number } | null | false {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2]) || size <= 0) return false;
  const first = match[1] ? Number(match[1]) : undefined;
  const last = match[2] ? Number(match[2]) : undefined;
  if ((first !== undefined && !Number.isSafeInteger(first)) || (last !== undefined && !Number.isSafeInteger(last))) return false;
  if (first === undefined) return last! > 0 ? { start: Math.max(0, size - last!), end: size - 1 } : false;
  if (first >= size || (last !== undefined && last < first)) return false;
  return { start: first, end: Math.min(last ?? size - 1, size - 1) };
}
