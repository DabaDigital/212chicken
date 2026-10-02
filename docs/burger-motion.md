# Interactive burger — 2 October 2026

The home hero now uses GSAP and CSS perspective for a photographic 2.5D scene.
The supplied assembled and exploded photographs are preserved. The existing
alpha-separated bottom bun, upper stack and garnish assets supply the depth;
the ingredients within the upper stack are not a reconstructed 3D mesh.

- One desktop opening sequence assembles the burger and bursts it apart.
- Click the food or the labelled control to alternate between both states.
- A damped pointer spring tilts the scene. Four groups of the original garnish
  travel at different depths. A brief CRUNCH! accent accompanies the burst.
- Touch has the same controls, positioned below the burger on narrow screens.
- Pause freezes the ambient float, pointer response and current transition.
  Scene work also pauses outside the viewport and when the document is hidden.
- Reduced motion and JavaScript/image failures retain the original static hero.
  Secondary artwork is decoded before the enhanced scene becomes visible.
- Repeated clicks retarget the current transition. React/GSAP contexts own the
  animations; observers, pointer listeners and the spring ticker are cleaned up.

Implementation: `Hero.tsx`, `Hero.module.css`, `motion/burger-motion.ts`,
`PageMotion.tsx`, and `MotionGate.tsx`. No new dependency is required.

Validation: ESLint, TypeScript and production compilation passed. Browser checks
covered both photographic states, burger click/tap, pause/resume, menu navigation
and return, console errors, and 320 / 390 / 768 / 1440 px layouts. These sizes had
no horizontal document overflow. Device checks used browser viewports, not
physical phones. The updated Playwright motion regression scenarios are provided
in `tests/e2e/motion.spec.ts`; the full automated suite was not run in this pass.

Run `npm run dev -- --port 3100` for the editable preview.
