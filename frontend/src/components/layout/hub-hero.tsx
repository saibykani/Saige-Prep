import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils";
import { PALETTE, type Tone } from "@/lib/visual-themes";

export interface HeroStat {
  /** Real number computed from content or the learner's own data. */
  value: number;
  label: string;
  suffix?: string;
}

export interface HeroAction {
  href: string;
  label: string;
  primary?: boolean;
}

/**
 * Refined banner for hub pages: a lightly tinted surface in the hub tone, a fine dot grid,
 * a short value line, real stats and CTAs. Text uses the normal foreground tokens (AA in both themes).
 */
export function HubHero({
  title,
  subtitle,
  eyebrow,
  stats = [],
  actions = [],
  tone = "evergreen",
}: {
  title: string;
  subtitle: ReactNode;
  eyebrow?: ReactNode;
  stats?: HeroStat[];
  actions?: HeroAction[];
  tone?: Tone;
}) {
  const t = PALETTE[tone];
  const style = { "--c1": t.from, "--c2": t.to, "--c3": t.to, "--c-ink": t.to } as CSSProperties;
  return (
    <header className="hub-hero relative isolate mb-8 overflow-hidden rounded-2xl px-6 py-7 text-foreground shadow-soft animate-slide-up sm:px-10 sm:py-10" style={style}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-dots absolute inset-0" />
      </div>

      <div className="relative max-w-2xl space-y-3">
        {eyebrow && <div className="text-sm font-medium text-muted">{eyebrow}</div>}
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{title}</h1>
        <p className="max-w-[62ch] text-[15px] leading-relaxed text-muted sm:text-base">{subtitle}</p>
      </div>

      {stats.length > 0 && (
        <dl className="relative mt-6 flex flex-wrap gap-2.5 sm:gap-3">
          {stats.map((s) => (
            <div key={s.label} className="min-w-[6.5rem] rounded-xl border border-border bg-surface/80 px-4 py-2.5 shadow-soft">
              <dt className="sr-only">{s.label}</dt>
              <dd className="stat-value text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
                <CountUp value={s.value} />
                {s.suffix}
              </dd>
              <dd aria-hidden className="text-xs font-medium text-muted">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {actions.length > 0 && (
        <div className="relative mt-6 flex flex-wrap gap-3">
          {actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={cn(
                "ripple press-fx group inline-flex h-10 items-center gap-2 overflow-hidden rounded-lg px-4 text-sm font-semibold transition-[background-color,box-shadow,transform] duration-200",
                a.primary
                  ? "bg-accent text-accent-foreground shadow-soft hover:bg-accent-strong hover:shadow-card"
                  : "border border-border-strong bg-surface text-foreground hover:bg-surface-hover",
              )}
            >
              {a.label}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden />
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
