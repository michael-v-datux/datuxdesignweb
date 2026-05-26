import { getSiteUrl } from "@/utils/seo";

export const prerender = false;

export function GET({ url }: { url: URL }) {
  const siteUrl = getSiteUrl(url.origin);

  const body = `User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/admin/

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
