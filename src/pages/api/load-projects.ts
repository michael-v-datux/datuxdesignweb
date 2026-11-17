// /src/pages/api/load-projects.ts
import { supabase } from '@/lib/supabaseClient';
import { projectCardCategory, projectCardThumbnail, projectCardTitle } from '@/lib/projects/card-labels';

import { orderProjectCards } from '../../../public/scripts/lib/project-cards.js';

export const prerender = false;

export async function GET({ url }) {
  const offset = Math.max(0, Number.parseInt(url.searchParams.get("offset") || "0", 10) || 0);
  const limit = Math.min(24, Math.max(1, Number.parseInt(url.searchParams.get("limit") || "3", 10) || 3));
  const lang = url.searchParams.get("lang") === "uk" ? "uk" : "en";

  const { data, error } = await supabase
    .from("projects")
    .select("slug, title_en, title_uk, category_en, category_uk, thumbnail_url, cover_url, is_published")
    .eq("is_published", true)
    .order("slug", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const projects = orderProjectCards(data || []).slice(offset, offset + limit)
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