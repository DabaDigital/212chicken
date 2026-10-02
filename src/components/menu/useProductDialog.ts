"use client";

import { useCallback, useRef, useState } from "react";

/** Tracks the product shown in the dialog and returns focus to the card that opened it. */
export function useProductDialog() {
  const [openId, setOpenId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const open = useCallback((id: string, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setOpenId(id);
  }, []);

  const close = useCallback(() => {
    setOpenId(null);
    const trigger = triggerRef.current;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  }, []);

  return { openId, open, close };
}
