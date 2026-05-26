import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import { getAdminSupabase } from "../../lib/supabaseServer";
import { normalizePublishFields } from "../../lib/projects/publish-state";

const supabase = getAdminSupabase();

export const prerender = false;

/** @deprecated Prefer server-side create in admin/projects/new.astro */
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

async function hashPasswordIfNeeded(
  isProtected: boolean,
  password: unknown
): Promise<string | null | undefined> {
  if (!isProtected) return null;
  if (typeof password !== "string" || password.length === 0) return undefined;
  return bcrypt.hash(password, 10);
}

/** @deprecated Prefer POST /api/admin/projects or server form in new.astro */
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { status, is_published } = normalizePublishFields({
    status: body.status,
    is_published: body.is_published,
  });

  const isProtected = !!body.is_protected;
  const passwordHash = await hashPasswordIfNeeded(isProtected, body.password);

  const payload: Record<string, unknown> = {
    title_en: body.title_en ?? null,
    title_uk: body.title_uk ?? null,
    description_en: body.description_en ?? null,
    description_uk: body.description_uk ?? null,
    thumbnail_url: body.thumbnail_url ?? null,
    is_protected: isProtected,
    status,
    is_published,
    content_en: null,
    content_uk: null,
    cover_url: null,
    category_en: null,
    category_uk: null,
    slug: body.slug ?? null,
  };

  if (passwordHash !== undefined) {
    payload.password_hash = passwordHash;
  }

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

/** @deprecated Prefer PATCH /api/admin/projects/[id] */
export const PUT: APIRoute = async ({ request }) => {
  const body = await request.json();

  if (!body.id) {
    return new Response(JSON.stringify({ error: "Missing id" }), {
      status: 400,
    });
  }

  const { status, is_published } = normalizePublishFields({
    status: body.status,
    is_published: body.is_published,
  });

  const isProtected = !!body.is_protected;
  const passwordHash = await hashPasswordIfNeeded(isProtected, body.password);

  const payload: Record<string, unknown> = {
    title_en: body.title_en ?? null,
    title_uk: body.title_uk ?? null,
    description_en: body.description_en ?? null,
    description_uk: body.description_uk ?? null,
    thumbnail_url: body.thumbnail_url ?? null,
    is_protected: isProtected,
    status,
    is_published,
  };

  if (passwordHash !== undefined) {
    payload.password_hash = passwordHash;
  } else if (!isProtected) {
    payload.password_hash = null;
  }

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
