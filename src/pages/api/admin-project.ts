import type { APIRoute } from "astro";
import { getAdminSupabase } from "../../lib/supabaseServer";

const supabase = getAdminSupabase();

export const prerender = false;

// ===========================
//    GET ONE PROJECT
// ===========================
export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id" }), {
      status: 400,
    });
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
};

// ===========================
//    CREATE PROJECT (POST)
// ===========================
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  const status = body.status ?? "draft";

  const payload = {
    title_en: body.title_en ?? null,
    title_uk: body.title_uk ?? null,
    description_en: body.description_en ?? null,
    description_uk: body.description_uk ?? null,

    // FIXED ↓
    thumbnail_url: body.thumbnail_url ?? null,

    is_protected: !!body.is_protected,
    password_hash: body.password || null,

    status,
    is_published: status === "published",

    // Do NOT touch these fields yet:
    content_en: null,
    content_uk: null,
    cover_url: null,
    category_en: null,
    category_uk: null,
    slug: body.slug ?? null,
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};

// ===========================
//    UPDATE PROJECT (PUT)
// ===========================
export const PUT: APIRoute = async ({ request }) => {
  const body = await request.json();

  if (!body.id) {
    return new Response(JSON.stringify({ error: "Missing id" }), {
      status: 400,
    });
  }

  const status = body.status ?? "draft";

  const payload = {
    title_en: body.title_en ?? null,
    title_uk: body.title_uk ?? null,
    description_en: body.description_en ?? null,
    description_uk: body.description_uk ?? null,

    // FIXED ↓
    thumbnail_url: body.thumbnail_url ?? null,

    is_protected: !!body.is_protected,
    password_hash: body.password || null,

    status,
    is_published: status === "published",
  };

  const { data, error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
};