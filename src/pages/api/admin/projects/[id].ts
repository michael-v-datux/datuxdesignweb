// src/pages/api/admin/projects/[id].ts
import type { APIRoute } from "astro";
import supabase from "../../../../lib/supabaseClient";

export const PATCH: APIRoute = async ({ params, request }) => {
  const id = params.id;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing project id" }), {
      status: 400,
    });
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
    });
  }

  const {
    slug,
    title_en,
    title_uk,
    description_en,
    description_uk,
    thumbnail_url,
    cover_url,
    category_en,
    category_uk,
    status,
    is_published,
    is_protected,
    password_hash,
  } = payload || {};

  const update: Record<string, any> = {};

  if (slug !== undefined) update.slug = slug;
  if (title_en !== undefined) update.title_en = title_en;
  if (title_uk !== undefined) update.title_uk = title_uk;
  if (description_en !== undefined) update.description_en = description_en;
  if (description_uk !== undefined) update.description_uk = description_uk;
  if (thumbnail_url !== undefined) update.thumbnail_url = thumbnail_url;
  if (cover_url !== undefined) update.cover_url = cover_url;
  if (category_en !== undefined) update.category_en = category_en;
  if (category_uk !== undefined) update.category_uk = category_uk;
  if (status !== undefined) update.status = status;
  if (is_published !== undefined) update.is_published = !!is_published;
  if (is_protected !== undefined) update.is_protected = !!is_protected;
  if (password_hash !== undefined) update.password_hash = password_hash;

  if (Object.keys(update).length === 0) {
    return new Response(JSON.stringify({ error: "Nothing to update" }), {
      status: 400,
    });
  }

  update.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("projects")
    .update(update)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("PATCH project error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ project: data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
