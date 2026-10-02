import "server-only";

import { brandImages } from "./assets";
import { site, siteUrl, socialLinks } from "./site";

/**
 * Factual, site-wide structured data only: the brand (Organization) and the website.
 * No Restaurant, address, opening hours, rating or offer is emitted: none is verified yet.
 */
export function organizationJsonLd(): Record<string, unknown> | null {
  if (!siteUrl) return null;
  const home = siteUrl.toString();
  const sameAs = socialLinks.map((link) => link.url);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${home}#organization`,
        name: site.name,
        url: home,
        logo: {
          "@type": "ImageObject",
          url: new URL(brandImages.logoPng.src, siteUrl).toString(),
          width: brandImages.logoPng.width,
          height: brandImages.logoPng.height,
        },
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        url: home,
        name: site.name,
        inLanguage: "fr-MA",
        publisher: { "@id": `${home}#organization` },
      },
    ],
  };
}
