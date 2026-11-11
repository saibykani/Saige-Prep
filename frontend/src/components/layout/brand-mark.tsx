import { cn } from "@/lib/utils";

/** The Saige-Prep mark: a check in a rounded tile, drawn in the current brand colour with an amber dot. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("h-7 w-7 shrink-0", className)}>
      <rect x="2" y="2" width="60" height="60" rx="16" style={{ fill: "var(--accent)" }} />
      <path d="M18 33.5 L28 43 L46.5 22.5" fill="none" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--accent-foreground)" }} />
      <circle cx="49" cy="15" r="6" strokeWidth="2.5" style={{ fill: "var(--highlight)", stroke: "var(--accent)" }} />
    </svg>
  );
}
