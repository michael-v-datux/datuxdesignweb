import type { APIRoute } from 'astro';
import { isAdminAuthenticated } from '@/lib/adminSession';

export const prerender = false;
export const GET: APIRoute = ({ request }) => new Response(
  JSON.stringify({ authenticated: isAdminAuthenticated(request) }),
  { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', Vary: 'Cookie' } }
);
