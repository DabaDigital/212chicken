import "server-only";

import assetMetrics from "@/generated/asset-metrics.json";

import { sourceAssets } from "./source-data";

/** Public base where scripts/sync-assets.mjs copies the runtime subset of the asset pack. */
const PUBLIC_ASSET_BASE = "/212";
const SAFE_ASSET_PATH = /^images\/[a-z0-9][a-z0-9._/-]*\.(webp|png)$/i;

export interface StaticImage {
  src: string;
  width: number;
  height: number;
}

/**
 * The one resolver from asset-pack paths (e.g. `images/menu/webp/box-n1.webp`)
 * to browser URLs (e.g. `/212/images/menu/webp/box-n1.webp`).
 */
export function assetUrl(sourcePath: string): string {
  if (!SAFE_ASSET_PATH.test(sourcePath) || sourcePath.includes("..")) {
    throw new Error(`[212 assets] Refusing to resolve unexpected asset path: ${sourcePath}`);
  }
  return `${PUBLIC_ASSET_BASE}/${sourcePath}`;
}

const manifestByPath = new Map(sourceAssets.map((asset) => [asset.path, asset]));

/** Resolves a pack path and reads its intrinsic dimensions from data/asset-manifest.json. */
export function assetImage(sourcePath: string): StaticImage {
  const entry = manifestByPath.get(sourcePath);
  if (!entry?.width || !entry.height) {
    throw new Error(`[212 assets] ${sourcePath} has no recorded dimensions in asset-manifest.json`);
  }
  return { src: assetUrl(sourcePath), width: entry.width, height: entry.height };
}

export const brandImages = {
  logo: assetImage("images/brand/logo-original.webp"),
  logoPng: assetImage("images/brand/logo.png"),
  burgerExploded: assetImage("images/hero/burger-exploded.webp"),
  burgerAssembled: assetImage("images/hero/burger-assembled.webp"),
  fries: assetImage("images/decor/floating-fries.webp"),
} as const;

export interface Bounds {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface HeroLayer extends StaticImage {
  id: "bun" | "stack" | "garnish";
  bounds: Bounds;
}

/**
 * Hero layers derived from the exploded frame by scripts/derive-assets.mjs (split along the art's own
 * transparent gaps, recomposition verified). Paint order: bun → stack → garnish.
 */
export const heroLayers: HeroLayer[] = assetMetrics.heroLayers.layers.map((layer) => ({
  id: layer.id as HeroLayer["id"],
  src: assetUrl(layer.path),
  width: assetMetrics.heroLayers.width,
  height: assetMetrics.heroLayers.height,
  bounds: layer.bounds,
}));

/** Alpha bounding box of the full exploded frame (fractions of the square canvas). */
export const heroBounds: Bounds = assetMetrics.heroBounds;

const productImageScale: Record<string, number> = assetMetrics.productImageScale;

/** Display scale for product photos with unusually large transparent padding (1 = as supplied). */
export function productImageScaleFor(productId: string): number {
  return productImageScale[productId] ?? 1;
}
