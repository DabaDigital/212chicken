"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

/*
 * Reduced motion and no-JS keep the intact server-rendered image. The optional controller loads
 * secondary artwork only when the burger enters the viewport; touch gets the same tap controls.
 */
const PageMotion = dynamic(() => import("./PageMotion"), { ssr: false });

export const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(MOTION_QUERY).matches;
const getServerSnapshot = () => false;

export function MotionGate({ children }: { children: ReactNode }) {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const root = useRef<HTMLDivElement>(null);
  const [painted, setPainted] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    let idle: number | undefined;
    const start = async () => {
      const photo = root.current?.querySelector<HTMLImageElement>("[data-hero-photo]");
      try { await photo?.decode(); } catch { /* Keep enhancement available after a failed photo. */ }
      if (cancelled) return;
      // Give the intact artwork a paint before fetching the optional animation and its images.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if ("requestIdleCallback" in window) {
            idle = window.requestIdleCallback(() => { if (!cancelled) setPainted(true); });
          } else if (!cancelled) setPainted(true);
        });
      });
    };
    if (document.readyState === "complete") void start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
      cancelAnimationFrame(frame);
      if (idle !== undefined) window.cancelIdleCallback(idle);
    };
  }, []);
  return (
    <div ref={root}>
      {children}
      {enabled && painted ? <PageMotion /> : null}
    </div>
  );
}
