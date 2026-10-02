# Animation assets

- `../images/hero/burger-assembled.png` — assembled state on a transparent square.
- `../images/hero/burger-exploded.png` — exploded state on the same canvas dimensions.
- Matching WebP files retain alpha and are smaller for the website.
- `../images/decor/floating-fries.png` — optional decorative element.

These are AI-generated promotional images. They are not exact product photography, a GLB model, a video, a Lottie file, or individually separated ingredient layers. Ingredient contours vary between the two images: use an intentional crossfade rather than claiming a geometrically exact morph. Real ingredient assembly requires separate layers or a 3D model.

## Integration

Copy the `images` and `animation` directories into your public assets directory. Adjust these relative paths to your app's asset root.

```html
<link rel="stylesheet" href="animation/burger.css">
<div class="burger-stage" role="img" aria-label="Burger au poulet croustillant">
  <img class="assembled" src="images/hero/burger-assembled.webp" alt="" width="1254" height="1254">
  <img class="exploded" src="images/hero/burger-exploded.webp" alt="" width="1254" height="1254">
</div>
<script src="animation/burger.js"></script>
<script>
  const stage = document.querySelector('.burger-stage');
  const cleanup = ChickenMotion.attachScroll(stage);
  // Call cleanup() when the component unmounts.
</script>
```

Use `ChickenMotion.setProgress(stage, 0..1)` to drive the transition from your own scroll timeline or slider instead. Do not attach two drivers to the same stage.

## Motion plan

| Element | Effect | Mobile / reduced motion |
|---|---|---|
| Hero | Assembled → exploded crossfade through scroll | Prefer static exploded image on small devices; static for reduced motion |
| Menu image | 3% scale on hover, 180ms | No hover-only information |
| Section entrance | 16px translate and fade, 550ms | Content visible by default; skip when reduced motion |
| Orange ribbon | Optional slow repeating translation | Static when reduced motion; pause control for continuous movement |
| Fries | Optional subtle 6px float | Disable on mobile and reduced motion |

The included `../index.html` demonstrates the actual two-frame crossfade, with a keyboard-accessible slider and optional scroll mode. Nothing requires GSAP or a paid animation library.
