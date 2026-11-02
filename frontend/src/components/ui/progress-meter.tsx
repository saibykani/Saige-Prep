import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Accessible progress bar that grows to its value on mount (CSS keyframe from 0) and
 * glides on change (transform transition). No JS animation, so it never lies about the value.
 */
export function ProgressMeter({
  value,
  label,
  showLabel = true,
  className,
}: {
  /** 0..1 */
  value: number;
  label: string;
  showLabel?: boolean;
  className?: string;
}) {
  const v = Math.max(0, Math.min(1, value));
  const pct = Math.round(v * 100);
  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-1.5 flex justify-between gap-2 text-xs text-muted">
          <span>{label}</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
      )}
      <div
        className="h-1.5 overflow-hidden rounded-full bg-surface-raised"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className={cn("progress-fill h-full rounded-full")} style={{ "--p": v } as CSSProperties} />
      </div>
    </div>
  );
}
