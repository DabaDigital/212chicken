import gsap from "gsap";
import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

import fontData from "@/generated/crunch-font.json";

export interface CrunchScene {
  burst: () => void;
  setPaused: (paused: boolean) => void;
  dispose: () => void;
}

/** Actual 3D typography/particles, with the supplied food photo as an alpha-cut photographic plane. */
export function createCrunchScene(frame: HTMLElement, art: HTMLElement, photo: HTMLImageElement): CrunchScene | null {
  const canvas = document.createElement("canvas");
  canvas.dataset.crunchCanvas = "true";
  canvas.setAttribute("aria-hidden", "true");
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.25 : 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
  camera.position.z = 11.3;
  const world = new THREE.Group();
  scene.add(world);
  scene.add(new THREE.HemisphereLight(0xfff8e8, 0x995021, 2.8));
  const key = new THREE.DirectionalLight(0xfff4db, 5);
  key.position.set(-4, 6, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 3.5);
  rim.position.set(5, 1, -2);
  scene.add(rim);

  const resources: Array<{ dispose: () => void }> = [];
  const keep = <T extends { dispose: () => void }>(resource: T): T => { resources.push(resource); return resource; };
  const front = keep(new THREE.MeshPhysicalMaterial({ color: 0xff6506, roughness: 0.3, metalness: 0.12, clearcoat: 0.6, clearcoatRoughness: 0.25 }));
  const side = keep(new THREE.MeshStandardMaterial({ color: 0xbc3000, roughness: 0.4, metalness: 0.1 }));
  const font = new FontLoader().parse(fontData);
  const lettering = new THREE.Group();
  const letters: THREE.Mesh[] = [];
  let advance = 0;
  for (const character of "212") {
    const geometry = keep(new THREE.ExtrudeGeometry(font.generateShapes(character, 4.6), {
      depth: 0.38, bevelEnabled: true, bevelThickness: 0.045, bevelSize: 0.035, bevelSegments: 3, curveSegments: 10, steps: 1,
    }));
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const width = box.max.x - box.min.x;
    geometry.translate(-(box.min.x + box.max.x) / 2, -(box.min.y + box.max.y) / 2, -0.19);
    const letter = new THREE.Mesh(geometry, [front, side]);
    letter.userData.homeX = advance + width / 2;
    advance += width + 0.17;
    letters.push(letter);
    lettering.add(letter);
  }
  for (const letter of letters) letter.userData.homeX -= (advance - 0.17) / 2;
  lettering.position.set(0, 0.85, -1.1);
  world.add(lettering);

  // Reuse the optimized local next/image bitmap. It remains a photo, not a fabricated burger model.
  const texture = keep(new THREE.Texture(photo));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
  const foodMaterial = keep(new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.025, side: THREE.DoubleSide, toneMapped: false }));
  const food = new THREE.Mesh(keep(new THREE.PlaneGeometry(6.5, 6.5)), foodMaterial);
  food.position.set(0, -0.05, 0.25);
  world.add(food);

  // Deterministic scatter avoids hydration randomness and makes replay states reproducible.
  const rand = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453123; return x - Math.floor(x); };
  const small = window.innerWidth < 768;
  const count = small ? 30 : 64;
  const crumbMaterial = keep(new THREE.MeshStandardMaterial({ color: 0xffc05a, roughness: 0.56, metalness: 0.12 }));
  const crumbGeometry = keep(new THREE.IcosahedronGeometry(1, 1));
  const crumbs = new THREE.InstancedMesh(crumbGeometry, crumbMaterial, count);
  crumbs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const seedMaterial = keep(new THREE.MeshStandardMaterial({ color: 0xffe1a0, roughness: 0.35 }));
  const seeds = new THREE.InstancedMesh(keep(new THREE.SphereGeometry(1, 6, 4)), seedMaterial, small ? 18 : 36);
  seeds.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  world.add(crumbs, seeds);
  const tint = new THREE.Color();
  for (let i = 0; i < count; i++) crumbs.setColorAt(i, tint.setHSL(0.07 + rand(i + 30) * 0.06, 0.93, 0.44 + rand(i + 50) * 0.2));
  const dummy = new THREE.Object3D();

  const ringMaterial = keep(new THREE.MeshBasicMaterial({ color: 0xff5a00, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
  const ring = new THREE.Mesh(keep(new THREE.TorusGeometry(2.8, 0.028, 8, 100)), ringMaterial);
  ring.rotation.set(0.5, -0.2, -0.25);
  ring.position.z = -0.3;
  world.add(ring);
  const echoMaterial = keep(ringMaterial.clone());
  const echo = new THREE.Mesh(ring.geometry, echoMaterial);
  echo.rotation.set(-0.5, 0.4, 0.3);
  echo.position.z = -0.7;
  world.add(echo);

  const state = { entry: 0, blast: 0, orbit: 0, shock: 0, aimX: 0, aimY: 0, scroll: 0 };
  let disposed = false;
  let paused = false;
  let visible = true;
  let running = false;
  let until = 0;
  let lastTime = performance.now();
  let scrollTarget = 0;
  let pointerX = 0;
  let pointerY = 0;
  let timeline: gsap.core.Timeline | null = null;
  const hero = art.closest<HTMLElement>("[data-hero]")!;

  function draw(time = performance.now()) {
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    const blend = 1 - Math.exp(-dt * 7);
    state.aimX += (pointerX - state.aimX) * blend;
    state.aimY += (pointerY - state.aimY) * blend;
    state.scroll += (scrollTarget - state.scroll) * blend;
    const entry = state.entry;
    const blast = state.blast;
    const progress = state.scroll;
    world.rotation.set(state.aimY * 0.08 + progress * 0.07, state.aimX * 0.13 - progress * 0.15, -progress * 0.08);
    camera.position.z = 11.3 + (1 - entry) * 1.8 + progress * 1.1 - blast * 0.42;
    camera.position.x = state.aimX * 0.18;
    camera.position.y = -state.aimY * 0.12;
    camera.lookAt(0, 0, 0);
    food.position.z = 0.25 + blast * 0.5;
    food.position.y = -0.05 + blast * 0.12 + progress * 0.28;
    food.rotation.set(-state.aimY * 0.08, state.aimX * 0.06, (1 - entry) * -0.14 - blast * 0.055);
    food.scale.setScalar(0.94 + entry * 0.06 + blast * 0.035);
    letters.forEach((letter, index) => {
      const direction = index - 1;
      letter.position.set(letter.userData.homeX + direction * (blast * 0.5 + progress * 0.12), direction * blast * 0.14, -blast * 0.5);
      letter.rotation.set((1 - entry) * 0.3 + blast * direction * 0.12, (1 - entry) * (0.65 + index * 0.13) - 0.12 + direction * blast * 0.2, direction * blast * 0.09);
    });
    lettering.rotation.z = -0.045 + progress * 0.055;
    lettering.position.y = 0.85 - progress * 0.18;
    for (let i = 0; i < count; i++) {
      const angle = rand(i + 1) * Math.PI * 2 + state.orbit * (0.35 + rand(i + 9) * 0.25);
      const radius = (2.25 + rand(i + 4) * 0.6) * (0.7 + entry * 0.3 + blast * (0.3 + rand(i + 7) * 0.25));
      dummy.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 1.04, Math.sin(angle * 2 + i) * 1.1 + blast * (rand(i + 25) - 0.5) * 2.2);
      dummy.rotation.set(i + state.orbit, i * 2 + state.orbit * 0.5, angle + state.orbit);
      const size = (0.035 + rand(i + 20) * 0.075) * (0.8 + entry * 0.2);
      dummy.scale.set(size, size * (0.7 + rand(i + 16)), size * 0.75);
      dummy.updateMatrix();
      crumbs.setMatrixAt(i, dummy.matrix);
    }
    crumbs.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < seeds.count; i++) {
      const angle = rand(i + 180) * Math.PI * 2 - state.orbit * 0.3;
      const radius = (2.3 + rand(i + 200) * 0.85) * (0.9 + entry * 0.1 + blast * 0.4);
      dummy.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, rand(i + 240) * 2 - 1);
      dummy.rotation.set(i, i + state.orbit, angle);
      dummy.scale.set(0.025, 0.06, 0.018);
      dummy.updateMatrix();
      seeds.setMatrixAt(i, dummy.matrix);
    }
    seeds.instanceMatrix.needsUpdate = true;
    ring.scale.setScalar(0.8 + state.shock * 0.9);
    echo.scale.setScalar(0.6 + state.shock * 1.05);
    ringMaterial.opacity = Math.sin(state.shock * Math.PI) * 0.55;
    echoMaterial.opacity = Math.sin(state.shock * Math.PI) * 0.25;
    renderer.render(scene, camera);
    canvas.dataset.frame = String((Number(canvas.dataset.frame) || 0) + 1);
    if (time > until && !timeline?.isActive()) {
      running = false;
      renderer.setAnimationLoop(null);
      canvas.dataset.running = "false";
    }
  }

  function wake(milliseconds = 1400) {
    until = performance.now() + milliseconds;
    if (disposed || paused || !visible || document.hidden || running) return;
    lastTime = performance.now();
    running = true;
    canvas.dataset.running = "true";
    renderer.setAnimationLoop(draw);
  }
  function burst() {
    if (disposed || paused) return;
    timeline?.kill();
    const orbit = state.orbit;
    timeline = gsap.timeline({ onUpdate: () => wake(350), onComplete: () => wake(600) });
    timeline.to(state, { blast: 1, duration: 0.45, ease: "power3.out" }, 0)
      .to(state, { blast: 0, duration: 1.65, ease: "power3.out" }, 0.45)
      .to(state, { orbit: orbit + Math.PI * 2, duration: 2.1, ease: "power3.out" }, 0)
      .fromTo(state, { shock: 0 }, { shock: 1, duration: 1.4, ease: "power2.out" }, 0);
    wake(2600);
  }
  function stop() {
    running = false;
    renderer.setAnimationLoop(null);
    canvas.dataset.running = "false";
  }
  function visibility() {
    const active = visible && !document.hidden && !paused;
    if (active) { timeline?.resume(); wake(); }
    else { timeline?.pause(); stop(); }
  }
  function onScroll() {
    const box = hero.getBoundingClientRect();
    scrollTarget = THREE.MathUtils.clamp(-box.top / box.height, 0, 1);
    if (visible) wake();
  }
  function move(event: PointerEvent) {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const box = art.getBoundingClientRect();
    pointerX = THREE.MathUtils.clamp((event.clientX - box.left) / box.width * 2 - 1, -1, 1);
    pointerY = THREE.MathUtils.clamp((event.clientY - box.top) / box.height * 2 - 1, -1, 1);
    wake();
  }
  function leave() { pointerX = 0; pointerY = 0; wake(); }
  function resize() {
    const size = frame.getBoundingClientRect().width * 1.2;
    renderer.setSize(size, size, false);
    wake();
  }
  const observer = new IntersectionObserver(([entry]) => { visible = Boolean(entry?.isIntersecting); visibility(); });
  const resizer = new ResizeObserver(resize);
  const lost = (event: Event) => {
    event.preventDefault();
    frame.dispatchEvent(new Event("crunch-context-lost"));
  };
  canvas.addEventListener("webglcontextlost", lost);
  art.addEventListener("pointermove", move, { passive: true });
  art.addEventListener("pointerleave", leave);
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", visibility);
  frame.appendChild(canvas);
  resize();
  onScroll();
  draw();
  observer.observe(frame);
  resizer.observe(frame);
  timeline = gsap.timeline({ onUpdate: () => wake(350), onComplete: () => wake(500) })
    .to(state, { entry: 1, duration: 1.5, ease: "power3.out" }, 0)
    .fromTo(state, { blast: 0.4 }, { blast: 0, duration: 1.5, ease: "power3.out" }, 0)
    .fromTo(state, { orbit: -2.8 }, { orbit: 0, duration: 1.8, ease: "power3.out" }, 0)
    .fromTo(state, { shock: 0 }, { shock: 1, duration: 1.6, ease: "power2.out" }, 0);
  wake(2400);

  return {
    burst,
    setPaused(value) { paused = value; visibility(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      timeline?.kill();
      stop();
      observer.disconnect();
      resizer.disconnect();
      art.removeEventListener("pointermove", move);
      art.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", lost);
      crumbs.dispose();
      seeds.dispose();
      resources.forEach(resource => resource.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
