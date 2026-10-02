"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore, type ReactNode } from "react";

/*
 * Progressive enhancement gate. Only desktops (≥ 1024px) without a reduced-motion preference download
 * GSAP; phones and tablets get the short CSS entrance in Hero.module.css. The page is complete without
 * either. PageMotion scopes every selector to this wrapper (its own parent element).
 */
const PageMotion = dynamic(() => import("./PageMotion"), { ssr: false });

export const MOTION_QUERY = "(min-width: 64rem) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(MOTION_QUERY).matches;
const getServerSnapshot = () => false;

export function MotionGate({ children }: { children: ReactNode }) {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <div>
      {children}
      {enabled ? <PageMotion /> : null}
    </div>
  );
}
