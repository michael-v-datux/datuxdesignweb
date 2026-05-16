import type { APIRoute } from 'astro';
import { clearAdminSessionCookie } from '@/lib/adminSession';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  clearAdminSessionCookie(cookies);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
