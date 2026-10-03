import gsap from "gsap";

import { whenEngaged } from "./engagement";

/** Photographic 2.5D: source frames and disjoint alpha layers. Transform ownership:
 * scroll → camera → float → explosion. No React renders on animation frames. */
export function createBurgerMotion(hero: HTMLElement, context: gsap.Context) {
  const select = gsap.utils.selector(hero);
  const art = hero.querySelector<HTMLElement>("[data-hero-art]")!;
  const camera = select("[data-burger-camera]");
  const assembled = select("[data-burger-assembled]");
  const exploded = select("[data-burger-exploded]");
  const toggle = hero.querySelector<HTMLButtonElement>("[data-burger-toggle]")!;
  const hit = hero.querySelector<HTMLButtonElement>("[data-burger-hit]")!;
  const pause = hero.querySelector<HTMLButtonElement>("[data-burger-pause]")!;
  const label = hero.querySelector<HTMLElement>("[data-burger-label]")!;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const desktop = window.matchMedia("(min-width: 64rem)").matches;
  let alive = true, loading = false, visible = false, ready = false;
  let userPaused = false, open = true, listening = false, impactStarted = false;
  let intro: gsap.core.Timeline | undefined;
  let transition: gsap.core.Timeline | undefined;
  let travel: gsap.core.Tween | undefined;
  let float: gsap.core.Tween | undefined;
  let ambientCrumbs: gsap.core.Tween | undefined;
  let impact: gsap.core.Timeline | undefined;

  // A damped spring carries pointer velocity through direction changes.
  const target = { x: 0, y: 0 };
  const position = { x: 0, y: 0, vx: 0, vy: 0 };
  const setX = gsap.quickSetter(camera, "rotationX", "deg");
  const setY = gsap.quickSetter(camera, "rotationY", "deg");
  const setNumber = gsap.quickSetter(select("[data-hero-number]"), "x", "px");
  const spring = (_time: number, delta: number) => {
    const dt = Math.min(delta / 1000, 0.032);
    position.vx += ((target.x - position.x) * 100 - position.vx * 10) * dt;
    position.vy += ((target.y - position.y) * 100 - position.vy * 10) * dt;
    position.x += position.vx * dt;
    position.y += position.vy * dt;
    setX(-position.y * 6);
    setY(position.x * 10);
    setNumber(position.x * -10);
  };
  const syncPlayback = () => {
    const active = ready && visible && !document.hidden && !userPaused;
    float?.paused(!active);
    ambientCrumbs?.paused(!active);
    intro?.paused(!active);
    travel?.paused(!active);
    if (impactStarted) impact?.paused(!active);
    const usePointer = active && finePointer.matches;
    if (usePointer && !listening) gsap.ticker.add(spring);
    if (!usePointer && listening) gsap.ticker.remove(spring);
    listening = usePointer;
  };
  const updateControl = () => {
    label.textContent = open ? "Assembler le burger" : "Faire exploser le burger";
    toggle.setAttribute("aria-pressed", String(open));
    hero.dataset.burgerState = open ? "exploded" : "assembled";
  };
  const pop = () => { impactStarted = true; impact?.restart(); };
  const toggleInContext = context.add("toggleBurger", () => {
    if (!ready || !transition) return;
    intro?.kill();
    intro = undefined;
    travel?.kill();
    open = !open;
    updateControl();
    // Retarget the existing playhead, including during rapid repeated clicks.
    if (userPaused) { transition.progress(open ? 1 : 0); return; }
    travel = transition.tweenTo(open ? transition.duration() : 0, {
      duration: open ? 1.15 : 0.8, ease: "power2.inOut",
    });
    if (open) pop();
  });
  let toggleAfterLoad = false;
  const onToggle = () => {
    if (!ready) {
      toggleAfterLoad = !toggleAfterLoad;
      loadArtwork();
    } else toggleInContext();
  };
  const onPause = () => {
    userPaused = !userPaused;
    pause.setAttribute("aria-pressed", String(userPaused));
    pause.setAttribute("aria-label", userPaused ? "Reprendre l’animation" : "Mettre l’animation en pause");
    syncPlayback();
  };
  const onPointer = (event: PointerEvent) => {
    if (!finePointer.matches || userPaused || event.pointerType === "touch") return;
    const bounds = art.getBoundingClientRect();
    target.x = gsap.utils.clamp(-1, 1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2);
    target.y = gsap.utils.clamp(-1, 1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2);
  };
  const resetPointer = () => { target.x = 0; target.y = 0; };

  const enhance = context.add("enhanceBurger", () => {
    if (!alive) return;
    gsap.set(camera, { transformPerspective: 1100, transformOrigin: "50% 52%" });
    gsap.set(assembled, { opacity: 1 });
    gsap.set(exploded, { opacity: 0 });
    transition = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } })
      .to(assembled, { scale: 0.94, rotation: -7, z: -65, duration: 0.25 }, 0)
      // Exchange photographs at peak velocity, avoiding a lingering double exposure.
      .to(assembled, { opacity: 0, duration: 0.09 }, 0.12)
      .to(exploded, { opacity: 1, duration: 0.09 }, 0.12)
      .fromTo(select('[data-hero-layer="stack"]'),
        { yPercent: 16, rotation: 5, scale: 0.88, z: -40 },
        { yPercent: -1.5, rotation: -2, scale: 1, z: 18, duration: 1.05 }, 0.08)
      .fromTo(select('[data-hero-layer="bun"]'),
        { yPercent: -16, rotation: -9, scale: 0.94, z: 0 },
        { yPercent: 1.5, rotation: 3, scale: 1, z: 36, duration: 1.08 }, 0.1)
      .fromTo(select("[data-burger-crumbs]"),
        { opacity: 0, scale: 0.95, xPercent: 0, yPercent: 0, rotation: 0, z: -20 },
        { opacity: 1, scale: 1.04,
          xPercent: (i) => i % 2 === 0 ? -2.5 : 2.5,
          yPercent: (i) => i < 2 ? -2 : 1,
          rotation: (i) => i % 2 === 0 ? -8 : 8,
          z: (i) => 30 + i * 12,
          duration: 0.9, stagger: 0.045 }, 0.17)
      .fromTo(select("[data-hero-shadow]"),
        { scaleX: 0.8, scaleY: 0.75, opacity: 0.7 },
        { scaleX: 1.16, scaleY: 1.05, opacity: 0.4, duration: 1 }, 0);
    transition.progress(1);
    art.dataset.layers = "ready";
    hero.dataset.burgerReady = "true";
    ready = true;
    updateControl();
    float = gsap.to(select("[data-burger-float]"), {
      yPercent: -1.4, rotation: -1.2, duration: 2.6,
      ease: "sine.inOut", repeat: -1, yoyo: true, paused: true,
    });
    ambientCrumbs = gsap.to(select('[data-hero-layer="garnish"]'), {
      yPercent: -1, rotation: 1.5, duration: 3.2,
      ease: "sine.inOut", repeat: -1, yoyo: true, paused: true,
    });
    impact = gsap.timeline({ paused: true })
      .fromTo(select("[data-crunch-word]"),
        { opacity: 0, scale: 0.92, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.16, ease: "power3.out" }, 0.12)
      .to(select("[data-crunch-word]"), { opacity: 0, scale: 1.06, y: -18, duration: 0.35 }, 0.46);
    // One desktop demonstration; touch visitors control the explosion themselves.
    if (desktop && window.scrollY < hero.offsetHeight / 2) {
      intro = gsap.timeline({ delay: 0.3 })
        .to(transition, { progress: 0, duration: 0.85, ease: "power2.inOut" })
        .call(pop, [], "+=0.25")
        .to(transition, { progress: 1, duration: 1.25, ease: "power2.inOut" });
    }
    syncPlayback();
    if (toggleAfterLoad) toggleInContext();
  });
  const loadArtwork = () => {
    if (loading) return;
    loading = true;
    art.dataset.layers = "loading";
    const images = [...hero.querySelectorAll<HTMLImageElement>("[data-burger-image]")];
    images.forEach((image) => { image.loading = "eager"; });
    Promise.all(images.map((image) => image.decode())).then(() => enhance()).catch(() => {
      if (alive) {
        art.removeAttribute("data-layers");
        hero.removeAttribute("data-burger-ready");
      }
    });
  };
  // Touch visitors get a fast, intact photo; their first tap loads and assembles the layers.
  if (!desktop) hero.dataset.burgerReady = "true";
  // Desktop: in view and after the visitor's first input. The layers rest slightly larger than the
  // intact photo (z-depth); revealing them unprompted would become a later LCP paint (engagement.ts).
  let engaged = false;
  const stopWaiting = desktop ? whenEngaged(() => {
    engaged = true;
    if (visible) loadArtwork();
  }) : () => {};
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry) return;
    visible = entry.isIntersecting;
    if (visible && desktop && engaged) loadArtwork();
    syncPlayback();
  }, { threshold: 0.05 });
  observer.observe(art);
  toggle.addEventListener("click", onToggle);
  hit.addEventListener("click", onToggle);
  pause.addEventListener("click", onPause);
  art.addEventListener("pointermove", onPointer);
  art.addEventListener("pointerleave", resetPointer);
  finePointer.addEventListener("change", syncPlayback);
  document.addEventListener("visibilitychange", syncPlayback);
  return () => {
    alive = false;
    stopWaiting();
    observer.disconnect();
    gsap.ticker.remove(spring);
    toggle.removeEventListener("click", onToggle);
    hit.removeEventListener("click", onToggle);
    pause.removeEventListener("click", onPause);
    art.removeEventListener("pointermove", onPointer);
    art.removeEventListener("pointerleave", resetPointer);
    finePointer.removeEventListener("change", syncPlayback);
    document.removeEventListener("visibilitychange", syncPlayback);
    art.removeAttribute("data-layers");
    hero.removeAttribute("data-burger-ready");
    hero.removeAttribute("data-burger-state");
    pause.setAttribute("aria-pressed", "false");
    pause.setAttribute("aria-label", "Mettre l’animation en pause");
    // quickSetter writes aren't tweens, so explicitly restore these properties.
    gsap.set(camera, { clearProps: "transform" });
    gsap.set(select("[data-hero-number]"), { clearProps: "transform" });
  };
}
