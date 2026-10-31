"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { applyTheme, readThemePreference, setThemePreference, subscribeTheme, type ThemePreference } from "@/lib/theme";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(subscribeTheme, readThemePreference, () => "system");
}

export function ThemeToggle({ showLabels = false, className }: { showLabels?: boolean; className?: string }) {
  const pref = useThemePreference();

  // Keep data-theme in sync (e.g. "system" when the OS preference changes).
  useEffect(() => applyTheme(pref), [pref]);

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn("inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5", className)}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = pref === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={showLabels ? undefined : `${label} theme`}
            title={`${label} theme`}
            onClick={() => setThemePreference(value)}
            className={cn(
              "press inline-flex h-7 items-center justify-center gap-1.5 rounded-md text-xs font-medium",
              showLabels ? "px-3" : "w-7",
              active ? "bg-accent-soft text-accent shadow-sm" : "text-subtle hover:bg-surface-raised hover:text-foreground",
            )}
          >
            <Icon
              className={cn("h-3.5 w-3.5 transition-transform duration-300 motion-reduce:transition-none", active && "rotate-[360deg]")}
              aria-hidden
            />
            {showLabels && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
