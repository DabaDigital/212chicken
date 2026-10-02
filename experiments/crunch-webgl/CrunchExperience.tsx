"use client";

import { Pause, Play, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { CrunchScene } from "./crunch-scene";
import styles from "./CrunchExperience.module.css";

/** The static hero paints first. WebGL is optional, local, and never loaded for reduced motion. */
export function CrunchExperience() {
  const anchor = useRef<HTMLDivElement>(null);
  const scene = useRef<CrunchScene | null>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const art = anchor.current?.closest<HTMLElement>("[data-crunch-art]");
    const frame = art?.querySelector<HTMLElement>("[data-crunch-frame]");
    const photo = art?.querySelector<HTMLImageElement>("[data-hero-photo]");
    if (!art || !frame || !photo) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false;
    let generation = 0;
    let near = false;

    const teardown = () => {
      generation++;
      scene.current?.dispose();
      scene.current = null;
      art.removeAttribute("data-crunch-ready");
      setReady(false);
      setPaused(false);
    };
    const start = async () => {
      if (media.matches || !near || scene.current || cancelled) return;
      const version = ++generation;
      try {
        // Reuse the decoded responsive next/image rather than downloading another burger texture.
        await photo.decode();
        const { createCrunchScene } = await import("./crunch-scene");
        if (cancelled || media.matches || version !== generation) return;
        const instance = createCrunchScene(frame, art, photo);
        if (!instance) return;
        scene.current = instance;
        art.setAttribute("data-crunch-ready", "true");
        setReady(true);
      } catch {
        // A failed GPU or optional chunk must leave the complete, usable server-rendered hero.
        if (!cancelled && version === generation) teardown();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      near = Boolean(entry?.isIntersecting);
      if (near) void start();
    }, { rootMargin: "120px" });
    observer.observe(frame);
    const preference = () => { if (media.matches) teardown(); else void start(); };
    media.addEventListener("change", preference);
    const lost = () => teardown();
    frame.addEventListener("crunch-context-lost", lost);
    return () => {
      cancelled = true;
      generation++;
      observer.disconnect();
      media.removeEventListener("change", preference);
      frame.removeEventListener("crunch-context-lost", lost);
      scene.current?.dispose();
      scene.current = null;
      art.removeAttribute("data-crunch-ready");
    };
  }, []);

  return (
    <div ref={anchor} className={styles.controls} hidden={!ready}>
      <button className={styles.burst} type="button" onClick={() => {
        scene.current?.setPaused(false);
        setPaused(false);
        scene.current?.burst();
      }}>
        <Zap size={18} aria-hidden="true" />
        Faites claquer
        <span className={styles.plus} aria-hidden="true">↗</span>
      </button>
      <button className={styles.pause} type="button" aria-label={paused ? "Reprendre les effets" : "Mettre les effets en pause"}
        aria-pressed={paused} onClick={() => {
          scene.current?.setPaused(!paused);
          setPaused(!paused);
        }}>
        {paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
      </button>
    </div>
  );
}
