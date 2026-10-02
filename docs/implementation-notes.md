# Implementation notes — 2026-10-01 refinement

## Existing project retained

Next.js 16.3.8 App Router, React 19.3, TypeScript, CSS Modules, npm, GSAP + ScrollTrigger + @gsap/react.
ASSET_ROOT is `212-chicken-assets/212-chicken-assets/`. Source art and source menu records are unchanged.
The three routes, accessible native dialogs, data adapters, local fonts, social image and SEO configuration
were retained. This work does not deploy the website.

## Visual and browsing changes

- The hero renders the original exploded WebP as one image, replacing three eager derived layer requests.
  The assembled and exploded contours differ, so there is no crossfade or claimed ingredient morph.
- Decorative 212 proportions now fit the desktop art column more closely. The orange ribbon is slimmer,
  and the contact shadow is softer. Anton line spacing preserves both cedillas and subtitle clearance.
- On phones the copy, primary action and restaurant link come before the alpha-aware food composition.
- The complete menu is one continuous product grid, with category labels, all 25 products, combined
  accent-insensitive search and category filtering, counts, and an accessible result announcement.
- A compact, sticky category strip remains available while scrolling. It supports native touch/keyboard
  scrolling, a visible scrollbar, and keeps the active button in view. Changing a category while deep in
  the results brings the search/results area back into view, rather than the page header.
- The empty state resets both query and category. Closing product details preserves both filters.
  Removing a category from the URL also resets the active filter.
- Product cards share image/name/price/action areas. Existing alpha-derived dessert scale corrections
  are now actually applied. The full card is a single keyboard and pointer target.
- Larger, two-line restaurant typography gives the lower section a clearer focal point; the real map
  search and Instagram link remain the only external journeys. There are no invented addresses or offers.

## Motion that is implemented

The home page wraps server-rendered children in a small `MotionGate` client boundary; `PageMotion` scopes
every GSAP selector to that wrapper (found through its own marker element, so the controller also starts
after client navigation and Back/Forward — a ref-ordering bug fixed on 2026-10-01). GSAP loads only at
widths of at least 1024px without a reduced-motion preference.

- Desktop entrance: heading settles by 14px; burger settles by 12px and from 98.5% scale, over 0.65–0.85s.
- One scrubbed scroll timeline across the hero: the burger group rises 24px, the 212 lags 18px behind,
  the shadow widens and softens, the ribbon shifts 32px — and the **stack opens**: once three layers
  are decoded, the bottom bun drops away (+7% of the canvas), the upper stack lifts (−2.5%) and the sauce
  drop + crumbs spread (scale 1 → 1.12). Everything returns to rest when scrolling back up.
- The layers are split from the exploded frame along its own transparent gaps (`scripts/derive-assets.mjs`)
  and recompose it pixel for pixel (checked at build time). They are requested only when desktop motion
  starts (display: none + lazy until then) and replace the intact photo invisibly once decoded.
- Below-fold section text moves up 14px over 0.5s when reached. Nothing starts at zero opacity.
- Mobile/tablet: short 10px CSS entrance only on the single intact image; no GSAP, layers, pointer
  tracking or scroll pinning.
- Reduced motion: final static composition. No-JavaScript rendering retains content and navigation.
- `useGSAP`/matchMedia cleanup reverts transforms and the layer swap on unmount and preference changes.
  There are no autoplaying loops, no pinning and no competing motion libraries.

**Partly implemented:** independent ingredients. Only the bottom bun, the sauce drop and the crumbs are
separate pieces of the supplied art; the top bun, lettuce, tomato, cheese and chicken overlap in the
flattened frame and move as one piece. A true assembled → exploded sequence needs the layers below.

An undocumented WebGL "crunch" experiment (Three.js, 3D "212" letters and particles) was found in the hero
after the verified refinement. In production it hid the burger entirely and loaded a 143 KB (gzip) chunk on
phones, so it was unwired and archived unchanged in `experiments/crunch-webgl/` (see its README).

For a future ingredient animation, supply complete transparent top bun, lettuce, tomato, cheese,
chicken, bottom bun, sauce and crumbs layers, each on the same 1254×1254 canvas. Keep the supplied
three-quarter camera angle, warm upper-left light, proportions and shared horizontal registration.
Provide assembled/exploded anchor coordinates for every layer (normalized x/y from the top-left),
paint order, and reconstructed pixels currently hidden behind adjacent ingredients. Validate the stack
at both endpoints before animating. Pixel-matched ingredient layers were not supplied or generated in this refinement.

## Rendering and SEO

Routes and meaningful content are statically rendered; filters/dialogs and motion are small client
components. Local WOFF2 fonts use next/font; runtime photos use next/image, AVIF with WebP fallback,
explicit intrinsic sizes and lazy loading below the fold. No Instagram embed is loaded.

`SITE_URL` must be a public HTTPS origin without credentials. Localhost/loopback cannot become
canonicals. Set `SITE_INDEXABLE=true` only for production. Without configuration, preview builds emit
noindex, disallow-all robots, no canonical, and an empty sitemap. No environment file was changed.
Production configuration was tested locally against the supplied brand domain; owner confirmation
is still required before deployment.

JSON-LD remains factual Organization + WebSite. Restaurant addresses, ratings, hours and availability
are omitted. Outstanding data is tracked in `content-and-launch.md`.

## Verification for this refinement

See `verification-2026-10-01.md` for commands, current measurements and limits. Earlier measurements
in this repository do not describe this refinement.

