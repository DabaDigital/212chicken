/**
 * The visitor's first pointer move, scroll, click or key press. Desktop starts the burger layers only
 * after it (see burger-motion.ts): browsers stop recording LCP at such input, so the layers' slightly
 * larger paint can't replace the intact photo as the LCP element. MotionGate starts watching at
 * hydration, before the lazily loaded motion controller exists, so early input is not missed.
 */
const EVENTS = ["pointermove", "pointerdown", "scroll", "keydown"] as const;
const waiting = new Set<() => void>();
let engaged = false;
let watching = false;

function onInput() {
  engaged = true;
  EVENTS.forEach((type) => window.removeEventListener(type, onInput, true));
  waiting.forEach((callback) => callback());
  waiting.clear();
}

export function watchEngagement() {
  if (engaged || watching) return;
  watching = true;
  EVENTS.forEach((type) => window.addEventListener(type, onInput, { capture: true, passive: true }));
}

/** Runs `callback` at the first input (at once if it already happened); returns an unsubscribe. */
export function whenEngaged(callback: () => void): () => void {
  if (engaged) {
    callback();
    return () => {};
  }
  watchEngagement();
  waiting.add(callback);
  return () => waiting.delete(callback);
}
