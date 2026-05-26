export const SUPPORTED_LANGS = ["en", "uk"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export function isSupportedLang(value: string | undefined | null): value is SupportedLang {
  return value === "en" || value === "uk";
}

export function detectLang(request: Request, pathname: string): SupportedLang {
  if (pathname.startsWith("/uk")) return "uk";
  if (pathname.startsWith("/en")) return "en";

  const cookie = request.headers.get("cookie")?.match(/(?:^|;\s*)preferredLanguage=(uk|en)(?:;|$)/)?.[1];
  if (isSupportedLang(cookie)) return cookie;

  const accept = request.headers.get("accept-language")?.toLowerCase() ?? "";
  if (accept.includes("uk")) return "uk";

  return "en";
}

/** Paths that are not locale-prefixed site pages (assets, admin, API, SEO). */
export function isNonLocalePath(pathname: string): boolean {
  if (pathname === "/") return true;
  return (
    /^\/(admin|api)(\/|$)/.test(pathname) ||
    /^\/(styles|scripts|icons|images|logo)\//.test(pathname) ||
    /^\/(favicon\.ico|robots\.txt|sitemap\.xml|sitemap\.xsl)$/.test(pathname)
  );
}

export function isInvalidLocalePrefix(pathname: string): boolean {
  if (isNonLocalePath(pathname)) return false;
  const match = pathname.match(/^\/([^/]+)(\/|$)/);
  if (!match) return false;
  return !isSupportedLang(match[1]) && match[1] !== "404";
}
