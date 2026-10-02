import "server-only";

import type { Metadata } from "next";

import { siteUrl } from "./site";

export const SITE_TITLE = "212 Chicken — Ça croque. Ça claque.";
export const SITE_DESCRIPTION =
  "212 Chicken : burgers au poulet croustillant, box à partager, wraps, tenders, milkshakes et desserts. Découvrez la carte et ses prix en dirhams.";

/**
 * Open Graph fields shared by every route. Next.js merges `openGraph` shallowly, so each page
 * spreads this base instead of relying on the layout. Only emitted with a configured SITE_URL,
 * which keeps localhost or preview hosts out of absolute social URLs.
 */
export function openGraphBase(): NonNullable<Metadata["openGraph"]> | undefined {
  if (!siteUrl) return undefined;
  return {
    type: "website",
    locale: "fr_MA",
    siteName: "212 Chicken",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "212 Chicken — Ça croque. Ça claque. Burger au poulet croustillant.",
      },
    ],
  };
}

interface PageMetadataInput {
  title?: string;
  description: string;
  /** Route path, e.g. `/carte`. Canonicals are emitted only when SITE_URL is configured. */
  path: `/${string}`;
}

/**
 * Route metadata with canonical + Open Graph URL derived from the validated SITE_URL.
 * Filters and search never change the canonical: `/carte?categorie=burger` → `/carte`.
 */
export function pageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  const og = openGraphBase();
  return {
    ...(title ? { title } : {}),
    description,
    ...(og
      ? {
          alternates: { canonical: path },
          openGraph: { ...og, url: path, title: title ? `${title} · 212 Chicken` : SITE_TITLE, description },
        }
      : {}),
  };
}
