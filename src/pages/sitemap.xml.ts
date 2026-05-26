import { supabase } from "@/lib/supabaseClient";
import { getSiteUrl } from "@/utils/seo";

export const prerender = false;

const LANGS = ["en", "uk"] as const;

const STATIC_ROUTES = ["", "portfolio", "articles", "privacy-policy", "cookie-policy", "terms"];

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(
  siteUrl: string,
  path: string,
  lastmod?: string | null,
  alternates?: { en: string; uk: string }
): string {
  const loc = `${siteUrl}${path}`;
  const altLinks =
    alternates &&
    LANGS.map(
      (lang) =>
        `    <xhtml:link rel="alternate" hreflang="${lang}" href="${xmlEscape(alternates[lang])}" />`
    ).join("\n");

  return `  <url>
    <loc>${xmlEscape(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod.split("T")[0]}</lastmod>` : ""}${altLinks ? `\n${altLinks}` : ""}
  </url>`;
}

export async function GET({ url }: { url: URL }) {
  const siteUrl = getSiteUrl(url.origin);
  const { data: projects } = await supabase
    .from("projects")
    .select("slug, updated_at")
    .eq("is_published", true)
    .order("updated_at", { ascending: false });

  const entries: string[] = [];

  for (const route of STATIC_ROUTES) {
    for (const lang of LANGS) {
      const path = route ? `/${lang}/${route}` : `/${lang}/`;
      const alternates = {
        en: route ? `${siteUrl}/en/${route}` : `${siteUrl}/en/`,
        uk: route ? `${siteUrl}/uk/${route}` : `${siteUrl}/uk/`,
      };
      entries.push(urlEntry(siteUrl, path, undefined, alternates));
    }
  }

  for (const project of projects ?? []) {
    const alternates = {
      en: `${siteUrl}/en/projects/${project.slug}`,
      uk: `${siteUrl}/uk/projects/${project.slug}`,
    };
    for (const lang of LANGS) {
      entries.push(
        urlEntry(
          siteUrl,
          `/${lang}/projects/${project.slug}`,
          project.updated_at,
          alternates
        )
      );
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
