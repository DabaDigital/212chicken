import "server-only";

import { brandImages } from "./assets";
import { site, siteUrl, socialLinks } from "./site";
import { getMenu } from "./menu";
import type { Restaurant } from "./restaurants";
import { SITE_DESCRIPTION } from "./metadata";

/**
 * Factual, site-wide structured data only: the brand (Organization) and the website.
 * Restaurant and menu graphs are emitted on their corresponding visible pages.
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
        alternateName: "212Chicken",
        description: SITE_DESCRIPTION,
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

export function restaurantJsonLd(restaurant: Restaurant): Record<string, unknown> | null {
  if (!siteUrl) return null;
  const url = new URL(`/restaurants/${restaurant.id}`, siteUrl).toString();
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${url}#restaurant`,
    name: `212 Chicken ${restaurant.name}`,
    url,
    parentOrganization: { "@id": `${siteUrl}#organization` },
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: restaurant.city,
      addressCountry: "MA",
    },
    hasMap: restaurant.mapsUrl,
    hasMenu: new URL("/carte", siteUrl).toString(),
    servesCuisine: ["Poulet croustillant", "Burgers"],
    // The shared illustration is not a verified photo of each branch.
    ...(restaurant.photo ? { image: new URL(restaurant.photo, siteUrl).toString() } : {}),
    // Source hours have no weekdays: do not invent a daily schedule or ratings.
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Record<string, unknown> | null {
  if (!siteUrl) return null;
  const base = siteUrl;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, base).toString(),
    })),
  };
}

export function menuJsonLd(): Record<string, unknown> | null {
  if (!siteUrl) return null;
  const base = siteUrl;
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": new URL("/carte#menu", base).toString(),
    name: "Carte 212 Chicken",
    url: new URL("/carte", base).toString(),
    inLanguage: "fr-MA",
    hasMenuSection: getMenu().groups.map((group) => ({
      "@type": "MenuSection",
      name: group.label,
      hasMenuItem: group.items.map((item) => ({
        "@type": "MenuItem",
        name: item.name,
        ...(item.description ? { description: item.description } : {}),
        image: new URL(item.image.src, base).toString(),
        offers: { "@type": "Offer", price: item.price, priceCurrency: "MAD" },
      })),
    })),
  };
}
