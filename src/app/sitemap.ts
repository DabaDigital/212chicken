import type { MetadataRoute } from "next";

import { isIndexable, siteUrl } from "@/lib/site";

const ROUTES = [
  { path: "/", priority: 1 },
  { path: "/carte", priority: 0.9 },
  { path: "/restaurants", priority: 0.7 },
] as const;

/** Canonical routes only (no filter/search permutations). Empty unless the production flags are set. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl;
  if (!isIndexable || !base) return [];
  return ROUTES.map(({ path, priority }) => ({
    url: new URL(path, base).toString(),
    changeFrequency: "monthly",
    priority,
  }));
}
