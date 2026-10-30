import { cn } from "@/lib/utils";

/** The Saige-Prep mark: same artwork as the favicon (src/app/icon.svg). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("h-7 w-7 shrink-0", className)}>
      <defs>
        <linearGradient id="sp-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9befc" />
          <stop offset="1" stopColor="#7563ec" />
        </linearGradient>
        <linearGradient id="sp-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#sp-bg)" />
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#sp-shine)" />
      <path d="M18 33.5 L28 43 L46.5 22.5" fill="none" stroke="#0d0b1a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="49" cy="15" r="6" fill="#4fbf8f" stroke="#7563ec" strokeWidth="2.5" />
    </svg>
  );
}
