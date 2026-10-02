"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Optional desktop enhancement (≥ 1024px, no reduced-motion preference). No hidden start states,
 * looping effects or pinning; the server-rendered hero is complete without it.
 *
 * A. Entry: headline lines settle, the burger group settles with its soft shadow.
 * B. One scrubbed timeline across the hero: the burger group rises, the "212" lags behind it, the
 *    ribbon slides, the shadow softens — and, once the three verified layers are decoded, the stack
 *    opens: the bottom bun drops away, the upper stack lifts and the sauce drop + crumbs spread.
 *    The upper stack (top bun → chicken) is one inseparable piece of the supplied art.
 * C. Rest: everything holds its scroll-linked position; nothing animates on its own.
 */
export default function PageMotion() {
  // The scope is this marker's parent (MotionGate's wrapper). A parent's ref is attached after its
  // children's layout effects when both mount in one commit (client navigation, back/forward), so the
  // marker's own ref is the reliable handle.
  const marker = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const root = marker.current?.parentElement;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 64rem) and (prefers-reduced-motion: no-preference)", (context) => {
      const hero = root.querySelector<HTMLElement>("[data-hero]");
      if (!hero) return;
      const select = gsap.utils.selector(root);

      const entry = gsap.timeline({ defaults: { duration: 0.65, ease: "power3.out" } });
      // Late hydration or history restoration must not replay an offscreen introduction.
      if (window.scrollY < hero.offsetHeight / 2) {
        entry
          .from(select("[data-hero-line]"), { y: 14, stagger: 0.08 }, 0)
          .from(select("[data-hero-intro]"), { y: 12, scale: 0.985, duration: 0.85 }, 0);
      }

      // Scroll and entrance own different wrappers; layer tweens join this same timeline below.
      const scroll = gsap.timeline({
        defaults: { ease: "none", duration: 1 },
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.5 },
      })
        .to(select("[data-hero-burger]"), { y: -24 }, 0)
        .to(select("[data-hero-number]"), { y: 18 }, 0)
        .to(select("[data-hero-shadow]"), { scaleX: 1.22, opacity: 0.55 }, 0)
        .to(select("[data-ribbon-track]"), { x: -32 }, 0);

      // Ingredient opening, only once the layers are decoded (loaded on demand, desktop only).
      const art = hero.querySelector<HTMLElement>("[data-hero-art]");
      const layers = select("[data-hero-layer]") as HTMLImageElement[];
      let alive = true;
      if (art && layers.length === 3) {
        const layer = (id: string) => layers.find((image) => image.dataset.heroLayer === id);
        const openStack = context.add("openStack", () => {
          if (!alive) return;
          art.setAttribute("data-layers", "ready");
          scroll
            .to(layer("bun") ?? [], { yPercent: 7 }, 0)
            .to(layer("stack") ?? [], { yPercent: -2.5 }, 0)
            .to(layer("garnish") ?? [], { scale: 1.12, transformOrigin: "50% 55%" }, 0);
          // Render the new tweens at the current scroll position instead of waiting for the next scroll.
          const time = scroll.time();
          scroll.time(time + 0.0001, true).time(time, true);
        });
        art.setAttribute("data-layers", "loading");
        Promise.all(layers.map((image) => image.decode()))
          .then(() => openStack())
          .catch(() => {
            // Keep the intact photo if any layer fails to load or decode.
            if (alive) art.removeAttribute("data-layers");
          });
      }

      for (const section of select("[data-reveal]")) {
        if (section.getBoundingClientRect().top <= window.innerHeight) continue;
        gsap.from(section, {
          y: 14, duration: 0.5, ease: "power2.out",
          scrollTrigger: { trigger: section, start: "top 92%", once: true },
        });
      }
      document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
      return () => {
        alive = false;
        art?.removeAttribute("data-layers");
      };
    });
    return () => mm.revert();
  });
  return <span ref={marker} hidden />;
}
