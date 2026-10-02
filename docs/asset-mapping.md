# Asset mapping

**ASSET_ROOT** = `212-chicken-assets/212-chicken-assets/` (the pack, kept untouched as the source of truth).

`npm run assets` (run automatically before `dev` and `build`) executes `scripts/sync-assets.mjs`, which:

1. verifies every runtime file exists, is listed in `data/asset-manifest.json` and matches its sha256;
2. copies only the runtime subset into `public/212/` (git-ignored, regenerated on each build);
3. deletes anything in `public/212/` that is no longer referenced;
4. regenerates `src/app/icon.png` and `src/app/apple-icon.png` from the logo (full mark on cream, never cropped or recoloured).

The pack location is referenced in exactly three places. Update all three if it moves:
`scripts/sync-assets.mjs` (`ASSET_ROOT`), `tsconfig.json` (`@pack/*` alias) and `src/app/fonts.ts`
(next/font needs literal paths).

The single resolver for browser URLs is `assetUrl()` in `src/lib/assets.ts`. Data path `images/menu/webp/box-n1.webp`
→ `/212/images/menu/webp/box-n1.webp`. Image dimensions come from `asset-manifest.json` / `menu.json`.

## Runtime assets

| Source (ASSET_ROOT/…) | Public URL | Used for |
|---|---|---|
| `images/brand/logo-original.webp` (137×265) | `/212/images/brand/logo-original.webp` | Header, mobile menu, footer logo |
| `images/brand/logo.png` | `/212/images/brand/logo.png` | Organization JSON-LD logo; source of the app icons and the social card |
| `images/hero/burger-exploded.webp` (1254², alpha) | `/212/images/hero/burger-exploded.webp` | Home hero (static frame, LCP) |
| `images/hero/burger-assembled.webp` (1254², alpha) | `/212/images/hero/burger-assembled.webp` | `/restaurants` illustration |
| `images/decor/floating-fries.webp` (1254², alpha) | `/212/images/decor/floating-fries.webp` | Copied, currently unused (the restaurant band now uses the campaign box art) |
| `images/menu/webp/<id>.webp` × 25 (800², alpha) | `/212/images/menu/webp/<id>.webp` | Product cards and product dialog, mapped by `products[].image`; four also decorate the social band tiles |
| `restaurants[].photo` (only entries with `"verified": true`) | `/212/<photo>` | Storefront photo on that restaurant's card; none in the snapshot |

## Campaign art supplied by the owner (2026-10-02)

Kept beside the pack in `212-chicken-assets/campaign/` (byte-for-byte, provenance in its README) and converted
by `scripts/derive-assets.mjs`: trimmed to the visible pixels, WebP q90; sizes recorded in
`src/generated/asset-metrics.json`, exposed as `campaignImages` in `src/lib/assets.ts`.

| Master | Public URL | Used for |
|---|---|---|
| `box-explosion.png` (1433×1098) | `/212/images/campaign/box-explosion.webp` (1265×1086) | Home restaurant band art |
| `tenders-dip.png` (1024×1536) | `/212/images/campaign/tenders-dip.webp` (1024×1273) | Social band tile (cropped to the tile) |
| `box-and-cup.png` (1536×1024) | `/212/images/campaign/cup.webp` (392×759) | Social band tile: the cup only, lifted out along its own transparent outline |

The four generated storefront images supplied the same day are not published (see the campaign README).

Images are served through `next/image` (`/_next/image`) as AVIF (WebP fallback) at responsive widths.
Quality 75 for product photos; 65 for the large campaign burger frames only (`next.config.ts` → `images.qualities`).

## Build-time only (never shipped as-is)

| Source | Use |
|---|---|
| `fonts/anton-400.woff2`, `fonts/dm-sans-400.woff2`, `fonts/dm-sans-600.woff2` | `next/font/local` (self-hosted, hashed, preloaded). DM Sans 500/700 are not used, so they are not loaded. |
| `fonts/anton-400.ttf`, `fonts/dm-sans-600.ttf` | Social card generation (`src/app/og.png/route.tsx`, Satori needs TTF) |
| `images/hero/burger-exploded.png` | Social card (`/og.png`, 1200×630, generated at build time) |
| `data/menu.json`, `data/website.json`, `data/asset-manifest.json` | Typed, validated adapters in `src/lib/` (`source-data.ts`, `menu.ts`, `site.ts`, `assets.ts`) |

## Not used (kept in the pack)

Derived at build time by `scripts/derive-assets.mjs` (never edited by hand): three hero layers in
`/212/images/hero/layers/` (bottom bun, upper stack, garnish), split along the exploded frame's own
transparent gaps and verified to recompose it exactly. The complete exploded WebP stays the hero source for
first paint, phones, reduced motion and no-JS; the layers are requested only by desktop motion. The derived
product scale metrics (`src/generated/asset-metrics.json`) are used by the product cards.

- `images/menu/png/*`, `images/menu/original/*.svg`: editing masters (SVGs embed multi-MB rasters).
- `images/backgrounds/original-pattern.webp`, `images/banners/*`: legacy promotions, not republished as current offers.
- `fonts/fonts.css`, `design/tokens.css` `@import`: fonts are loaded once through next/font instead.
- `animation/burger.js` / `burger.css`: replaced by the single GSAP controller (see `implementation-notes.md`).
- `data/menu.csv`, `data/menu.js`: duplicates of `menu.json`; the JSON stays the single source of truth.
- `index.html`: the pack's asset browser, not the website.

## Provenance and licences

- Logo, product photos, pattern and banners are 212 Chicken brand assets; no open licence is asserted.
- Hero frames and fries are generated campaign artwork (`design/generation-prompts.txt`); they illustrate, they never replace product photos.
- Anton and DM Sans: SIL Open Font License, see `fonts/anton-OFL.txt` and `fonts/dmsans-OFL.txt` (keep them with any redistribution).
