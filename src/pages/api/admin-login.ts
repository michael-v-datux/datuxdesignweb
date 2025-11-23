import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { username, password } = await request.json();

  const ADMIN_USER = import.meta.env.ADMIN_USER;
  const ADMIN_PASS = import.meta.env.ADMIN_PASS;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return new Response("OK", { status: 200 });
  }

  return new Response("Unauthorized", { status: 401 });
};