import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { username, password } = await request.json();

  const ADMIN_USER = import.meta.env.ADMIN_USER;
  const ADMIN_PASS = import.meta.env.ADMIN_PASS;

  if (!ADMIN_USER || !ADMIN_PASS) {
    return new Response(JSON.stringify({ error: "Admin env vars missing" }), {
      status: 500,
    });
  }

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Invalid credentials" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
};