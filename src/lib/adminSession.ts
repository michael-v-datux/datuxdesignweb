import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

export const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function sessionSecret(): string {
  const secret =
    import.meta.env.ADMIN_SESSION_SECRET ||
    import.meta.env.ADMIN_PASS ||
    '';
  if (!secret) {
    throw new Error('[admin] Missing ADMIN_SESSION_SECRET or ADMIN_PASS');
  }
  return secret;
}

function sign(payloadB64: string): string {
  return createHmac('sha256', sessionSecret()).update(payloadB64).digest('base64url');
}

export function createSessionToken(username: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC;
  const payloadB64 = Buffer.from(JSON.stringify({ exp, u: username })).toString(
    'base64url'
  );
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return false;

  const expected = sign(payloadB64);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }

  try {
    const { exp } = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    return typeof exp === 'number' && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function getSessionTokenFromRequest(request: Request): string | undefined {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === ADMIN_SESSION_COOKIE) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return undefined;
}

export function isAdminAuthenticated(request: Request): boolean {
  return verifySessionToken(getSessionTokenFromRequest(request));
}

export function setAdminSessionCookie(cookies: AstroCookies, username: string): void {
  cookies.set(ADMIN_SESSION_COOKIE, createSessionToken(username), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

export function clearAdminSessionCookie(cookies: AstroCookies): void {
  cookies.delete(ADMIN_SESSION_COOKIE, { path: '/' });
}

export function isProtectedAdminApi(pathname: string): boolean {
  if (!pathname.startsWith('/api/admin')) return false;
  return pathname !== '/api/admin-login' && pathname !== '/api/admin-logout';
}

export function isProtectedAdminPage(pathname: string): boolean {
  return pathname.startsWith('/admin/');
}
