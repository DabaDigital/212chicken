# Archived experiment: WebGL "crunch" hero (not used by the site)

These files were added to the hero after the 2026-10-01 verified refinement, without documentation
or verification. They were unwired on 2026-10-01 and moved here unchanged so nothing is lost.

Why it was removed from the page:

- **The burger disappeared.** In a production build (Edge 154, desktop 1440×900 and phone 390×844) the
  scene rendered extruded 3D "212" letters and particles, but the photographic burger plane was blank,
  so the hero showed no food at all.
- It added a 143 KB (gzip) Three.js chunk, loaded on phones too, against the project rules (Three.js only
  with a real GLB model; lighter mobile motion) and the refinement brief.
- Synthetic 3D crumbs, glowing torus rings and a new "Faites claquer" button are not supplied assets or
  part of the approved design; the button also collided with the ribbon on desktop.

To revive it, restore `three`, `@types/three` (and `opentype.js` for `derive-crunch-font.mjs`), move the
files back to `src/components/home/` and `src/generated/`, render `<CrunchExperience />` in the hero, and
fix the photo texture before anything else.
