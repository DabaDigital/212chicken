# Campaign art (supplied 2026-10-02)

Generated, illustrative artwork supplied by the owner (ChatGPT exports, transparent PNG). It decorates
the home page; it never stands in for product photos, which stay the original menu images in the pack.
Files are kept byte-for-byte as supplied; only the names changed.

| File | Original export | Size | Used for |
|---|---|---|---|
| `box-explosion.png` | `212 Chicken Crispy Feast Explosion.png` | 1433 × 1098 | Home restaurant band |
| `tenders-dip.png` | `ChatGPT Image Oct 2, 2026, 11_54_50 AM.png` | 1024 × 1536 | Home social band tile |
| `box-and-cup.png` | `212 Chicken Crispy Feast Explosion-2.png` | 1536 × 1024 | Home social band tile (the cup only) |

`npm run assets` derives the runtime WebP files from these masters (`scripts/derive-assets.mjs`):
trimmed to their visible pixels; the cup is lifted out of `box-and-cup.png` along its own transparent
outline, so no food is sliced. Output: `public/212/images/campaign/`.

Not published: the four generated storefront images supplied the same day. Each shows a different logo on
its sign, so they cannot all match the brand, and a generated storefront cannot illustrate a specific
restaurant. Restaurant cards use real photos given per restaurant (`photo` in `data/website.json`).
