// /src/pages/api/load-projects.ts
import { supabase } from '@/lib/supabaseClient';
import { projectCardCategory, projectCardThumbnail, projectCardTitle } from '@/lib/projects/card-labels';

export const prerender = false;

export async function GET({ url }) {
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);
  const limit = parseInt(url.searchParams.get("limit") || "3", 10);
  const lang = url.searchParams.get("lang") || "en";

  const { data, error } = await supabase
    .from("projects")
    .select("slug, title_en, title_uk, category_en, category_uk, thumbnail_url, cover_url, is_published")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const projects = data
    .map((p) => ({
      slug: p.slug,
      title: projectCardTitle(p),
      category: projectCardCategory(p),
      thumbnail: projectCardThumbnail(p),
      lang,
    }))
    .filter((p) => p.title);

  return new Response(JSON.stringify(projects), {
    headers: { "Content-Type": "application/json" },
  });
}