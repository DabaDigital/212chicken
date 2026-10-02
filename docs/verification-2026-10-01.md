# Verification — 212 Chicken refinement, 2026-10-01

## Automated checks

- `npm run lint`, `npm run typecheck`, `npm run build`: passed. All routes statically prerendered.
- Production-server Playwright suite: **58 passed, 2 skipped**. Skips are mobile-menu tests on desktop.
- Includes all 25 products, category URL sync, Wraps mapping, combined search/filtering, empty-state
  reset, preserved filters after dialogs, sticky filter navigation, keyboard focus containment and return,
  mobile navigation, real CTAs, 404, metadata, and minimum 44px targets.
- axe-core WCAG A/AA: zero violations on all three routes and the open product dialog, desktop + mobile.
- Verified actual dimensions/transparency of 33 brand, hero, decor and menu assets against the manifest;
  zero mismatches. Build-time synchronization also verifies runtime file hashes and paths.

## Visual and motion checks

Production captures at widths **320, 390, 430, 768, 1024, 1440, 1920**, plus **844×390 landscape**,
for `/`, `/carte`, `/restaurants` and 404. No horizontal overflow, failed asset requests, broken images,
console errors or hydration errors were detected. Desktop, mobile and tablet captures were visually
compared with the supplied references. Typography spacing keeps the cedillas clear of the next line
and subtitle. The supplied food remains intact; transparent canvas edges may extend beyond gutters.

Before captures: `screenshots/before/` (390 and 1440, home and carte).
After captures: `screenshots/` (route-width.png).
Motion captures: `screenshots/motion/` (initial and five scroll checkpoints per configuration).

`node scripts/verify-motion.mjs` checked normal desktop, normal phone, reduced motion and no JavaScript:
- desktop scroll changes burger transforms gradually;
- mobile/reduced/no-JS remain static while scrolling;
- changing the preference to reduced clears transforms;
- menu/home route navigation returns one hero without runtime errors.

The captures show progress at 0/25/50/75/100% of the hero's height scrolled, not ingredient-assembly
states. This refinement implements an intact-image parallax fallback, not separate ingredient animation.
No browser video is claimed. Artifacts are local and git-ignored.

## SEO configuration check

A separate local build used `SITE_URL=https://212chicken.ma` and `SITE_INDEXABLE=true` to verify all
three canonical URLs, matching Open Graph URLs, social PNG, sitemap entries, robots and Organization +
WebSite JSON-LD. The root canonical is normalized by Next.js (the optional trailing slash is equivalent).
No fabricated Restaurant schema is present. Owner confirmation of the production domain is still needed.
The default preview build is restored afterwards; no environment file or deployment is changed.

## Measured performance

Lighthouse **13.5.0**, local production `next start`, headless Microsoft Edge, default mobile simulated
throttling, one run per route with production metadata enabled. These are lab observations, not field data.

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/` | 93 | 100 | 100 | 100 | 3.22 s | 0 | 37 ms |
| `/carte` | 93 | 100 | 100 | 100 | 3.20 s | 0 | 31 ms |
| `/restaurants` | 97 | 100 | 100 | 100 | 2.67 s | 0 | 54 ms |

Reports: `screenshots/lighthouse-{home,carte,restaurants}.json`.
Performance scores meet the ≥90 lab target; **LCP does not yet meet 2.5 seconds** in these simulated runs.
The main transfer inspection found the hero AVIF at about 44 KB, Anton at about 48 KB, the largest
Next/React JS chunk at about 72 KB and blocking CSS at about 8.5 KB. GSAP is excluded on phones.
A first preview-config run scored 91/94/99 performance; its SEO score was 66 because preview indexing
is deliberately disabled. That preview score does not indicate broken production canonicals.

Not measured: field INP or field LCP, real phones/Safari/Firefox, exact 200% browser zoom, deployment/CDN
latency. Reflow and a short landscape viewport were checked in Chromium. Measurements will vary by run
and host. Final small CSS changes only adjust tablet decorative type and product transform origin.

Final preview recheck: 6 targeted tests passed (touch targets, sticky category/results navigation and preview noindex), and 390/768px home/menu captures passed after the last CSS adjustments.

## Addendum — later on 2026-10-01 (supersedes the motion and Lighthouse rows above)

Changes: an undocumented WebGL hero experiment that hid the burger was unwired and archived
(`experiments/crunch-webgl/`, `three`/`opentype.js` removed); desktop motion now opens the stack with the
verified layers; a controller bug that disabled all motion after client navigation or Back was fixed; the
first `/carte` photo (its LCP element on phones) is no longer lazy-loaded.

- `npm run lint`, `npm run typecheck`, `npm run build`: passed; largest client chunk 69 KB gzip (React).
- Playwright on the production server: **62 passed, 4 skipped** (mobile-menu tests on desktop and
  device-specific motion tests), including the new `tests/e2e/motion.spec.ts`: layers load only on desktop
  motion, open with scroll, survive a `/` → `/carte` → Back round-trip; phones never request them; reduced
  motion stays static. axe-core: zero WCAG A/AA violations.
- Screenshot sweep at 320, 390, 430, 768, 1024, 1440 and 844×390 for every route and the 404: no overflow,
  console errors, failed requests or broken images.
- Motion probe (Edge, 1440×900): at 0/25/50/75/100% of the hero scroll the bottom bun moves 0 → 6.6 → 22 →
  37 → 53 px, the stack 0 → −19 px, the garnish scales 1 → 1.12, the burger group −24 px, the "212" +18 px;
  all return to 0 at the top. Phone and reduced-motion runs load no GSAP and no layers.
- **Browser videos** (Playwright, Edge): `qa/videos/desktop-motion.webm` (entrance, slow scroll through the
  hero, into the menu and back), `qa/videos/mobile-motion.webm`, `qa/videos/desktop-reduced-motion.webm`.
  Progress captures: `qa/motion/desktop-progress-{0,25,50,75,100}.png`. Before captures: `qa/before/`.
- Lighthouse 13.5.0, mobile simulated throttling, local `next start`, preview config: `/` 93 (LCP 3.3 s),
  `/restaurants` 90 (LCP 2.9 s), `/carte` 88–91 over three runs (LCP 3.3–3.8 s); accessibility and best
  practices 100; CLS 0. **LCP is still above 2.5 s in these simulated runs.**

Not verified: real devices, Safari/Firefox, field LCP/INP, exact 200% zoom.
