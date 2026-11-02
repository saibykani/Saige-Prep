"use client";

import { useEffect } from "react";

/**
 * One delegated pointer listener for the whole app: when the pointer moves over a
 * `.spotlight` element, its local coordinates are written to `--mx`/`--my` so the
 * CSS glow follows the cursor. Writes are batched to one per animation frame and
 * only touch CSS variables (no React state, no re-renders). Skipped for touch,
 * coarse pointers and reduced motion.
 */
export function useSpotlight() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let last: PointerEvent | null = null;

    function flush() {
      frame = 0;
      const event = last;
      if (!event || !(event.target instanceof Element)) return;
      const el = event.target.closest<HTMLElement>(".spotlight");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      el.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }

    function onMove(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !fine.matches || reduced.matches) return;
      last = event;
      if (!frame) frame = requestAnimationFrame(flush);
    }

    /** Ripple: restart a CSS animation at the press point on `.ripple` elements. */
    function onDown(event: PointerEvent) {
      if (reduced.matches || !(event.target instanceof Element)) return;
      const el = event.target.closest<HTMLElement>(".ripple");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--rx", `${event.clientX - rect.left}px`);
      el.style.setProperty("--ry", `${event.clientY - rect.top}px`);
      el.classList.remove("rippling");
      void el.offsetWidth; // restart the animation
      el.classList.add("rippling");
    }

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}
