"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";

/**
 * Fades/rises its content in the first time it scrolls into view. The observer writes a
 * data attribute straight to the DOM (no React state). Content is only hidden while motion
 * is allowed and JS is running (see `[data-reveal]` in globals.css).
 */
export function Reveal({ as: Tag = "div", ...props }: HTMLAttributes<HTMLElement> & { as?: "div" | "section" }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.revealed = "";
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.revealed = "";
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <Tag ref={ref as never} data-reveal="" {...props} />;
}
