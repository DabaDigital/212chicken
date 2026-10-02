# 212 Chicken — Option 1 asset pack

Start with **index.html**: a local asset browser with category filtering, PNG download links and an interactive animation preview. It opens directly in a browser and makes no network requests.

## Included

| Folder | Content |
|---|---|
| images/menu/original | 25 original product SVG files from the existing website |
| images/menu/png | 25 transparent 800 × 800 PNG exports |
| images/menu/webp | 25 optimized WebP exports with alpha |
| images/brand | Original brand logo in WebP and PNG |
| images/hero | Generated assembled and exploded burger states, PNG + WebP |
| images/decor | Generated floating fries, PNG + WebP |
| images/backgrounds | Original illustrated background for optional reuse |
| images/banners | 7 existing promotion/category banners for reference/reuse |
| fonts | Anton 400 and DM Sans 400/500/600/700, local fonts and OFL licenses |
| data | Complete extracted source menu in JSON and CSV; website content/configuration |
| design | Color, typography, responsive and spacing tokens in CSS/JSON |
| animation | Dependency-free scroll crossfade helper and integration guide |
| references | Selected desktop, mobile and tablet mockups |

## Typography

**Anton** for headlines; **DM Sans** for navigation, body text, buttons, and product details. These are practical real-font approximations to the AI mockup, not a claim that its lettering exactly matches a font. Import `fonts/fonts.css` once. Use display weight 400; use DM Sans 400–700 as appropriate. Both font licenses are included.

## Menu and website data

The menu was retrieved from https://212chicken.ma/ on **2026-09-30**: 25 products, eight source categories, prices in MAD. Each product carries its source page and image URL. This is a snapshot of published content, not a live inventory or a guarantee that prices are current at launch.

`description_fr` remains null where the source has no description. Availability, allergens, calories and menu-upgrade contents remain unknown. The burger menu supplement is +16 MAD as published; do not infer what it includes. Royal 212 Wistor is listed under Burgers in the source but has a separate proposed `display_category_id: wraps` for the redesign. Royal Crispy Bacon has a source-name/description discrepancy flagged in `needs_review`.

The source contact page displays `+212 6 00 00 00 00` but its call link points to `+33983489459`. Neither is configured as the official phone. Source hours are recorded as observations only. Restaurant addresses, verified hours, ordering URL and verified contact details still need the owner's input. Missing data is null or an empty list rather than invented. Instagram and the source restaurant-search link are included. Reviews/reels are empty until real content is supplied.

Hero slogans and CTA labels are proposed copy; product names, descriptions, prices and original images are source content. Do not publish the original banners as current promotions without review.

## Responsive implementation direction

- 320–639px: stacked hero; two product columns when each can remain at least 150px wide, otherwise one; compact navigation; 20px gutters.
- 640–1023px: balanced hero columns when text fits; two or three menu columns; 32px gutters.
- 1024px+: side-by-side hero; three menu columns; max-width 1440px.
- Keep labels at readable sizes, controls at least 44px, images `object-fit: contain`; no forced horizontal page scrolling.
- Keep the burger and the large “212” text separate: the latter should be real text behind the image, not baked into an image.
- Cream surfaces and the orange ribbon should be CSS backgrounds. This avoids downloading unnecessary full-screen background images.
- Use dark text on bright orange buttons for small text; use black buttons with cream text for primary actions.
- Use WebP files on the site, PNGs for editing, original SVG files as source masters. Some SVG files embed large raster images; they are not lightweight vectors.

## Asset provenance and use

Original logo, menu photography, pattern and banners remain 212 Chicken brand assets; no open license is asserted for them. Generated hero/decor images are illustrative campaign artwork and are separate from the original product photos. Retain source records in `data/menu.json` and `data/asset-manifest.json`.

The transparent hero PNGs are static animation inputs, not a 3D model or finished video. The included crossfade demo is functional; its start/end frames are not pixel-identical ingredient layers. See `animation/README.md`.

This pack supplies assets, data and reusable motion code, not a completed ordering system. The final website still needs integration, verified business data, and responsive/browser testing.

## Sources

- Website/menu: https://212chicken.ma/ and product-page URLs in `data/menu.json`.
- Contact source: https://212chicken.ma/contact
- Brand Instagram: https://www.instagram.com/212_chicken_maroc/
- Font: https://fonts.google.com/specimen/Anton
- Font: https://fonts.google.com/specimen/DM+Sans
- Font licenses: https://github.com/google/fonts/tree/main/ofl/anton and https://github.com/google/fonts/tree/main/ofl/dmsans
