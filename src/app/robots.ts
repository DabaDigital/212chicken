import type { MetadataRoute } from "next";

import { isIndexable, siteUrl } from "@/lib/site";

/** Previews (no SITE_INDEXABLE=true) disallow everything; production allows and lists the sitemap. */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable || !siteUrl) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
