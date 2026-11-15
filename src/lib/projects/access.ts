import { createHmac, timingSafeEqual, createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getServerSupabase } from '../supabaseServer';

const MAX_AGE = 60 * 60 * 24;
export const projectCookieName = (slug: string) => `unlocked_project_${slug}`;
function secret() {
  const value = import.meta.env.PROJECT_SESSION_SECRET || import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error('Missing project session signing secret');
  return value;
}
const fingerprint = (hash: string) => createHash('sha256').update(hash).digest('hex');
const sign = (payload: string, signingSecret: string) => createHmac('sha256', signingSecret).update(payload).digest('base64url');

/** A password change invalidates previously issued access tokens. */
export function issueProjectToken(slug: string, passwordHash: string, signingSecret = secret(), now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ slug, hash: fingerprint(passwordHash), exp: Math.floor(now / 1000) + MAX_AGE })).toString('base64url');
  return `${payload}.${sign(payload, signingSecret)}`;
}
export function verifyProjectToken(token: string | undefined, slug: string, passwordHash: string, signingSecret = secret(), now = Date.now()) {
  if (!token || !passwordHash) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payload, signature] = parts;
    const actual = Buffer.from(signature);
    const expected = Buffer.from(sign(payload, signingSecret));
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.slug === slug && data.hash === fingerprint(passwordHash) && Number.isFinite(data.exp) && data.exp > Math.floor(now / 1000);
  } catch { return false; }
}
export async function projectPasswordHash(project: { id: string; password_hash?: string | null }) {
  const { data, error } = await getServerSupabase().from('project_credentials').select('password_hash').eq('project_id', project.id).maybeSingle();
  // Compatibility while the access migration and code deploy in sequence.
  if (error && error.code !== '42P01' && error.code !== 'PGRST205') throw new Error('Project access lookup failed');
  return data?.password_hash || project.password_hash || '';
}
export async function matchesProjectPassword(value: unknown, hash: string) {
  return typeof value === 'string' && value.length > 0 && value.length <= 256 && !!hash && bcrypt.compare(value, hash);
}
export const projectCookieOptions = { path: '/', httpOnly: true, sameSite: 'lax' as const, secure: import.meta.env.PROD, maxAge: MAX_AGE };
export function requestProjectToken(request: Request, slug: string) {
  return request.headers.get('cookie')?.split(';').map(s => s.trim()).find(s => s.startsWith(projectCookieName(slug) + '='))?.slice(projectCookieName(slug).length + 1);
}
