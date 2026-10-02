import "server-only";

import { sourceWebsite } from "./source-data";

/**
 * Production configuration (see .env.example / docs/content-and-launch.md):
 * - SITE_URL       absolute https origin used for canonicals, sitemap, Open Graph and JSON-LD.
 * - SITE_INDEXABLE "true" only for the production deployment. Anything else emits noindex
 *                  and a disallow-all robots.txt, which keeps previews out of search engines.
 */
function parseSiteUrl(raw: string | undefined): URL | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const isLocal = url.hostname === "localhost" || url.hostname.endsWith(".localhost") ||
      url.hostname.startsWith("127.") || url.hostname === "0.0.0.0" || url.hostname === "[::1]";
    if (url.protocol !== "https:" || isLocal || url.username || url.password) {
      throw new Error("SITE_URL must be a public https origin without credentials");
    }
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url;
  } catch (error) {
    throw new Error(`[212 config] Invalid SITE_URL "${raw}": ${(error as Error).message}`);
  }
}

function parseExternalUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export const siteUrl = parseSiteUrl(process.env.SITE_URL);

/** Indexing requires both the explicit flag and a validated public https origin. */
export const isIndexable = process.env.SITE_INDEXABLE === "true" && siteUrl?.protocol === "https:";

export function absoluteUrl(pathname: string): string | null {
  return siteUrl ? new URL(pathname, siteUrl).toString() : null;
}

const instagramUrl = parseExternalUrl(sourceWebsite.brand.instagram);
const instagramHandle = instagramUrl ? new URL(instagramUrl).pathname.split("/").filter(Boolean)[0] ?? null : null;

export const site = {
  name: sourceWebsite.brand.name,
  locale: sourceWebsite.brand.locale,
  copy: sourceWebsite.proposed_copy,
  instagram: instagramUrl && instagramHandle ? { url: instagramUrl, handle: `@${instagramHandle}` } : null,
  /** General Google Maps search supplied by the brand, not a nearest-store detection. */
  restaurantSearchUrl: parseExternalUrl(sourceWebsite.links.restaurant_search),
  /** null until the owner supplies a verified ordering destination. */
  orderingUrl: parseExternalUrl(sourceWebsite.links.ordering),
  /** Only verified restaurant records may ever be rendered (currently none supplied). */
  restaurants: sourceWebsite.restaurants,
} as const;
