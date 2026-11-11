"use client";

import { Check } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { ACCENTS, readAccent, setAccent, subscribeAccent, type Accent } from "@/lib/theme";

/** Swatch colours for the picker (the light-mode brand value of each accent). */
const SWATCH: Record<Accent, { label: string; color: string }> = {
  evergreen: { label: "Evergreen", color: "#0c6e60" },
  indigo: { label: "Indigo", color: "#4d50b8" },
  coral: { label: "Coral", color: "#b23e29" },
  plum: { label: "Plum", color: "#82387e" },
};

export function useAccent(): Accent {
  return useSyncExternalStore(subscribeAccent, readAccent, () => "evergreen");
}

/** Brand colour picker. Only the accent tokens change; saved on this device. */
export function AccentPicker({ className }: { className?: string }) {
  const accent = useAccent();
  return (
    <div role="radiogroup" aria-label="Accent colour" className={cn("flex flex-wrap gap-2", className)}>
      {ACCENTS.map((a) => {
        const active = accent === a;
        return (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setAccent(a)}
            className={cn(
              "press inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium",
              active ? "border-accent bg-accent-soft text-foreground" : "border-border text-muted hover:border-border-strong hover:text-foreground",
            )}
          >
            <span
              aria-hidden
              className="flex h-4 w-4 items-center justify-center rounded-full ring-1 ring-black/10 dark:ring-white/20"
              style={{ background: SWATCH[a].color }}
            >
              {active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </span>
            {SWATCH[a].label}
          </button>
        );
      })}
    </div>
  );
}
