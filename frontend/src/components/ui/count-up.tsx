"use client";

import { useEffect, useRef } from "react";

/**
 * Renders `value` and, on mount or change, animates the visible digits up to it.
 * The animation writes straight to the DOM (no state updates) and settles on the
 * real value within a second, so the number is never motion-only.
 */
export function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = from.current;
    if (start === value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = String(value);
      from.current = value;
      return;
    }
    let frame = 0;
    let t0 = 0;
    const tick = (now: number) => {
      if (!t0) t0 = now;
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(start + (value - start) * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
      else from.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      el.textContent = String(value);
    };
  }, [value, duration]);

  // Server/first render already shows the real value; the effect replays it from 0.
  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}
