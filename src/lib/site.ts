import "server-only";

import { sourceWebsite } from "./source-data";

/**
 * Production configuration (see .env.example / docs/content-and-launch.md):
 * - SITE_URL       absolute https origin used for canonicals, sitemap, Open Graph and JSON-LD.
 * - Vercel production uses its stable production domain and permits indexing by default.
 * - SITE_INDEXABLE=false opts out; Vercel previews always stay non-indexable.
 * - Other hosts require SITE_URL and SITE_INDEXABLE=true.
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

const isVercelProduction = process.env.VERCEL_ENV === "production";
const isVercelPreview = Boolean(process.env.VERCEL_ENV) && !isVercelProduction;
export const siteUrl = parseSiteUrl(process.env.SITE_URL ||
  (isVercelProduction && process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined));

// The owner's development domain must stay out of search even on a production hosting slot.
const isDevelopmentDomain = siteUrl?.hostname === "212chicken.dabadigital.ma";

/** Never index preview/development deployments, even if they inherit production settings. */
export const isIndexable = !isVercelPreview && !isDevelopmentDomain && Boolean(siteUrl) &&
  (process.env.SITE_INDEXABLE === undefined ? isVercelProduction : process.env.SITE_INDEXABLE === "true");

export function absoluteUrl(pathname: string): string | null {
  return siteUrl ? new URL(pathname, siteUrl).toString() : null;
}

const instagramUrl = parseExternalUrl(sourceWebsite.brand.instagram);
const instagramHandle = instagramUrl ? new URL(instagramUrl).pathname.split("/").filter(Boolean)[0] ?? null : null;

// TikTok profile URLs carry the handle as an "@name" path segment.
const tiktokUrl = parseExternalUrl(sourceWebsite.brand.tiktok);
const tiktokHandle = tiktokUrl
  ? new URL(tiktokUrl).pathname.split("/").find((segment) => /^@[\w.]+$/.test(segment)) ?? null
  : null;

export interface SocialProfile {
  url: string;
  handle: string;
}

export interface SocialLink extends SocialProfile {
  id: "instagram" | "tiktok";
  label: string;
}

const instagram: SocialProfile | null =
  instagramUrl && instagramHandle ? { url: instagramUrl, handle: `@${instagramHandle}` } : null;
const tiktok: SocialProfile | null = tiktokUrl && tiktokHandle ? { url: tiktokUrl, handle: tiktokHandle } : null;

export const site = {
  name: sourceWebsite.brand.name,
  locale: sourceWebsite.brand.locale,
  copy: sourceWebsite.proposed_copy,
  instagram,
  /** Official profile supplied by the owner (2026-10-02); null when website.json has none. */
  tiktok,
  /** General Google Maps search supplied by the brand, not a nearest-store detection. */
  restaurantSearchUrl: parseExternalUrl(sourceWebsite.links.restaurant_search),
  /** null until the owner supplies a verified ordering destination. */
  orderingUrl: parseExternalUrl(sourceWebsite.links.ordering),
} as const;

/** The brand's official accounts in display order: only those configured in website.json. */
export const socialLinks: SocialLink[] = [
  ...(instagram ? [{ id: "instagram" as const, label: "Instagram", ...instagram }] : []),
  ...(tiktok ? [{ id: "tiktok" as const, label: "TikTok", ...tiktok }] : []),
];
