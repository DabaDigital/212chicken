"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore, type ReactNode } from "react";

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
  return (
    <div>
      {children}
      {enabled ? <PageMotion /> : null}
    </div>
  );
}
