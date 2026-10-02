"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { createBurgerMotion } from "./burger-motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function PageMotion() {
  const marker = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const root = marker.current?.parentElement;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", (context) => {
      const hero = root.querySelector<HTMLElement>("[data-hero]");
      if (!hero) return;
      return createBurgerMotion(hero, context);
    });
    mm.add("(min-width: 64rem) and (prefers-reduced-motion: no-preference)", () => {
      const hero = root.querySelector<HTMLElement>("[data-hero]");
      if (!hero) return;
      const select = gsap.utils.selector(root);
      let alive = true;
      if (window.scrollY < hero.offsetHeight / 2) {
        gsap.from(select("[data-hero-line]"), { y: 18, duration: 0.65, stagger: 0.08, ease: "power3.out" });
      }
      gsap.timeline({
        defaults: { ease: "none", duration: 1 },
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.5 },
      })
        .to(select("[data-hero-burger]"), { y: -50, rotation: -3 }, 0)
        .to(select("[data-hero-number]"), { y: 28 }, 0)
        .to(select("[data-ribbon-track]"), { x: -48 }, 0);
      for (const section of select("[data-reveal]")) {
        if (section.getBoundingClientRect().top <= window.innerHeight) continue;
        gsap.from(section, {
          y: 14, duration: 0.5, ease: "power2.out",
          scrollTrigger: { trigger: section, start: "top 92%", once: true },
        });
      }
      document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
      return () => { alive = false; };
    });
    return () => mm.revert();
  });
  return <span ref={marker} hidden />;
}
