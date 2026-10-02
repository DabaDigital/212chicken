# Content, data rules and launch blockers

The supplied dataset is the **2026-09-30 snapshot** of https://212chicken.ma (menu) plus proposed copy
(`data/website.json`). It is not live inventory. If the pack files change, they win: the adapters re-read them
at build time and fail the build on malformed data (`src/lib/source-data.ts`).

## What the site publishes

| Data | Where | Rule |
|---|---|---|
| 25 products: names, prices (MAD, shown "DH"), descriptions, photos | `/carte`, home selection, product dialog | Exactly as published. `description_fr: null` → no description (9 products: tex-mex, milkshakes, desserts) |
| Menu supplement (+16 MAD) | Product dialog, "Supplément menu : +16 DH" | Shown where `menu_upgrade_price` exists; its contents are never described |
| 8 source categories + proposed `wraps` | Category filters / groups | Generated from the data, so no product can disappear |
| Hero lines, description, CTA labels, "À chacun son crunch." | Home | `website.json → proposed_copy` |
| Instagram `@212_chicken_maroc` | Header menu (mobile), home band, footer, `/restaurants`, JSON-LD `sameAs` | From `brand.instagram` |
| Google Maps search | Home band, `/restaurants` | `links.restaurant_search`, labelled as a general search (no "nearest restaurant" claim) |

Not published: phone numbers (the source shows `+212 6 00 00 00 00` but calls `+33983489459`), hours,
addresses, availability, allergens, calories, reviews, reels, promotions, delivery or ordering. Null values are
never rendered as "available", "sold out" or similar. Developer review notes (`needs_review`) never reach the UI.

## Display categories (presentation only)

Source ids and labels stay untouched in `menu.json`. Labels below live in `src/lib/menu.ts`.

| display id | Label | Source label | Products |
|---|---|---|---|
| `box-family` | Box à partager | Boxs family | 3 |
| `star-box` | Star Box | Star boxs | 4 |
| `star-box-combo` | Combos | Star boxs combos | 3 |
| `burger` | Burgers | Burgers | 4 |
| `wraps` | Wraps | *(proposed; source: Burgers)* | 1 — Royal 212 Wistor |
| `salade` | Salades | Salades | 1 |
| `texmex` | Tex-mex | Tex-mex | 2 |
| `milk-shake` | Milkshakes | Milkshakes | 3 |
| `dessert` | Desserts | Desserts | 4 |

Home "selection" (not "best sellers": no sales evidence): Royal Crunch Double, Long 212 Pepper, Royal 212 Wistor,
212 Skin Tenders, Box N°1, Wings BBQ & Miel, plus quick filters Burgers / Box à partager / Wraps / Star Box
(edit `HOME_SELECTION_IDS` / `HOME_FILTER_IDS` in `src/lib/menu.ts`).

Mockup labels not reproduced: "Sides" (no such category in the data) and the "L'esprit 212" nav item (no content).
"Commander" is not shown: there is no verified ordering URL (see below).

## Launch blockers (owner input needed)

From `website.json → missing_before_launch` and the per-product `needs_review` notes:

1. **Restaurant list**: addresses, coordinates and opening hours per restaurant (`restaurants: []`). Until then
   `/restaurants` only offers the Google Maps search. Do not add `Restaurant` JSON-LD before this is verified.
2. **Official phone number**: source text and call link disagree; neither is published.
3. **Ordering URL / service** (`links.ordering: null`). Once set to an https URL, the header CTA and the product
   dialog switch to "Commander" automatically.
4. **Menu supplement contents** (+16 MAD on 5 burgers/wrap): what it includes.
5. **Allergens and availability** for every product.
6. **Royal Crispy Bacon**: the name says bacon, the description does not; confirm the recipe.
7. **Royal 212 Wistor** in "Wraps": confirm the proposed re-categorisation (source lists it under Burgers).
8. **New products**: photos and details for items missing from the source catalogue.
9. **Reels and reviews**: real links and usage permission (nothing is rendered while the lists are empty).
10. **Prices**: re-check against the live menu just before launch (snapshot date 2026-09-30).
11. **Production URL**: confirm the domain (`SITE_URL`) and set `SITE_INDEXABLE=true` on production only.
12. **Copy sign-off**: hero lines, "À chacun son crunch." intro, "Envie de croquer ?" band, 404 copy.
