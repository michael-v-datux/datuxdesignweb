import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabaseClient";

export const prerender = false;

// GET /api/admin-projects
export const GET: APIRoute = async () => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data ?? []), {
    headers: { "Content-Type": "application/json" },
  });
};

// DELETE /api/admin-projects
export const DELETE: APIRoute = async ({ request }) => {
  const { id } = await request.json();

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id" }), {
      status: 400,
    });
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};