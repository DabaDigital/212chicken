# 212 Chicken — « Crunch in Motion »

Responsive restaurant website for 212 Chicken, built from the approved Option 1 mockups
(`212-chicken-assets/212-chicken-assets/references/`) with Next.js 16 (App Router) and TypeScript.

- `/`: hero « ÇA CROQUE. ÇA CLAQUE. » with the floating burger and the "212" layer, orange ribbon, filterable menu
  selection, restaurant finder band (cards once restaurants are confirmed), "Suivez le crunch." social band.
- `/carte`: all 25 products in a unified grid, 9 display categories as wrapping filters (no sideways scrolling; sticky on
  wide screens; deep-linkable `?categorie=`), accent-insensitive search, accessible product dialog.
- `/restaurants`: honest restaurant finder (Google Maps search) until verified addresses exist.
- Branded 404, sitemap, robots, social card, icons, JSON-LD.

## Run it

```bash
npm install
npm run dev           # http://localhost:3000 (copies runtime assets from the pack first)
npm run build         # production build (also copies assets)
npm run start         # serve the build
```

`dev` and `build` use webpack (`--webpack`) instead of the Next.js 16 default, Turbopack. Windows Smart App Control
blocks the unsigned native SWC binary (`@next/swc-win32-x64-msvc`: "An Application Control policy has blocked this
file"). Next.js then falls back to WebAssembly SWC, which compiles and minifies but cannot run Turbopack. Using the
same bundler for both keeps local builds identical to deployed ones. Remove the flag from both scripts together only
if every machine that builds the site can load the native binding.

Quality checks:

```bash
npm run lint
npm run typecheck
npm run build && npm run test:e2e      # Playwright: starts `next start -p 3100`
BASE_URL=http://localhost:3000 npm run test:e2e   # or test a running server
node scripts/screenshots.mjs           # full-page screenshots at all test widths → ./screenshots/
node scripts/verify-motion.mjs         # motion/reduced-motion/no-JS captures (BASE_URL or :3101)
```

Playwright and the screenshot script use the locally installed Microsoft Edge (`BROWSER_CHANNEL=chrome` to use
Google Chrome instead), so no browser download is needed.

Current refinement results and Lighthouse conditions: [verification notes](docs/verification-2026-10-01.md).
The hero paints the intact exploded artwork; on desktop, scrolling opens the stack (bottom bun, sauce and
crumbs move independently of the upper stack) with a lagging "212". Full ingredient-by-ingredient animation
requires additional layers. See [implementation notes](docs/implementation-notes.md).

## Configure production

Set on the production deployment only (see `.env.example`):

```
SITE_URL=https://212chicken.ma
SITE_INDEXABLE=true
```

Without them the build is a non-indexable preview (noindex, disallow-all robots, no canonicals).
To enable ordering, set `links.ordering` in the pack's `data/website.json` to a verified https URL; the
"Commander" actions appear automatically.

## Structure

```
212-chicken-assets/…   source asset pack (ASSET_ROOT): data, fonts, images, references. Not edited.
scripts/                sync-assets.mjs (runtime copies + icons), screenshots.mjs (visual QA)
src/app/                routes, layout, metadata, sitemap, robots, og.png, fonts, global tokens
src/components/         home, layout, menu, motion, restaurants, seo, ui
src/lib/                typed adapters: source-data, menu, site, assets, metadata, structured-data, format
tests/e2e/              Playwright journeys + axe accessibility + SEO checks
docs/                   asset mapping, content rules and launch blockers, implementation notes and QA results
```

## Documentation

- [docs/asset-mapping.md](docs/asset-mapping.md): which pack files are used where, and how they are copied.
- [docs/content-and-launch.md](docs/content-and-launch.md): data rules, category mapping, **launch blockers**.
- [docs/implementation-notes.md](docs/implementation-notes.md): design and motion decisions, performance,
  accessibility, SEO, deployment and the QA results.
