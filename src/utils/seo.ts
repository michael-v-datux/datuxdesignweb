export type SeoMeta = {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
};

export const SITE_NAME = "datux.design";

export function getSiteUrl(fallbackOrigin: string): string {
  const fromEnv = import.meta.env.PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return fallbackOrigin.replace(/\/$/, "");
}

export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function buildPageTitle(pageTitle?: string): string {
  const trimmed = pageTitle?.trim();
  if (!trimmed) return SITE_NAME;
  if (trimmed.includes(SITE_NAME)) return trimmed;
  return `${trimmed} | ${SITE_NAME}`;
}

export function getLangPath(pathname: string, targetLang: "en" | "uk"): string {
  if (!/^\/(en|uk)(\/|$)/.test(pathname)) return `/${targetLang}/`;
  return pathname.replace(/^\/(en|uk)(?=\/|$)/, `/${targetLang}`) || `/${targetLang}/`;
}

export function getAlternateLangPath(pathname: string, currentLang: string): string | null {
  const altLang = currentLang === "en" ? "uk" : "en";
  return getLangPath(pathname, altLang);
}

export function resolveAbsoluteUrl(siteUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function resolveSeo(
  defaults: { title: string; description: string },
  seo: SeoMeta = {}
) {
  const title = buildPageTitle(seo.title || defaults.title);
  const description = stripHtml(seo.description?.trim() || defaults.description);
  return { title, description };
}
