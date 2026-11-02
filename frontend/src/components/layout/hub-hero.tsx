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
 * Vibrant banner for hub pages: gradient background, floating decorative shapes,
 * a short value line, real stats and CTAs. Text is white on stops that all keep AA.
 */
export function HubHero({
  title,
  subtitle,
  eyebrow,
  stats = [],
  actions = [],
  tone = "violet",
}: {
  title: string;
  subtitle: ReactNode;
  eyebrow?: ReactNode;
  stats?: HeroStat[];
  actions?: HeroAction[];
  tone?: Tone;
}) {
  const t = PALETTE[tone];
  const style = { "--c1": t.from, "--c2": t.via, "--c3": t.to } as CSSProperties;
  return (
    <header className="hub-hero relative isolate mb-8 overflow-hidden rounded-3xl px-5 py-7 text-white shadow-elevated animate-slide-up sm:px-9 sm:py-10" style={style}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-dots absolute inset-0" />
        <svg className="hero-float absolute -right-10 -top-16 h-64 w-64 opacity-30 sm:h-80 sm:w-80" viewBox="0 0 200 200" style={{ "--dur": "14s" } as CSSProperties}>
          <path
            fill="white"
            d="M44.7,-58.6C57.1,-49.6,66,-35.4,70.4,-19.6C74.8,-3.8,74.7,13.6,67.6,27.4C60.5,41.2,46.4,51.4,31.2,58.8C16,66.2,-0.3,70.8,-17.6,68.3C-34.9,65.8,-53.2,56.2,-63.6,41.2C-74,26.2,-76.5,5.8,-71.6,-11.9C-66.7,-29.6,-54.4,-44.6,-40.1,-53.4C-25.8,-62.2,-12.9,-64.8,1.6,-66.9C16.1,-69,32.3,-67.6,44.7,-58.6Z"
            transform="translate(100 100)"
          />
        </svg>
        <span className="hero-float absolute bottom-6 right-[22%] hidden h-16 w-16 rounded-2xl border-2 border-white/35 sm:block" style={{ "--dur": "11s", "--delay": "-3s", "--tilt": "18deg" } as CSSProperties} />
        <span className="hero-float absolute right-[8%] top-[55%] h-6 w-6 rounded-full bg-white/40" style={{ "--dur": "9s", "--delay": "-5s" } as CSSProperties} />
        <span className="hero-float absolute -bottom-20 left-[38%] h-48 w-48 rounded-full border-[18px] border-white/10" style={{ "--dur": "18s" } as CSSProperties} />
        <svg className="hero-float absolute right-[34%] top-6 hidden h-10 w-10 text-white/50 md:block" viewBox="0 0 24 24" style={{ "--dur": "10s", "--delay": "-2s" } as CSSProperties}>
          <path fill="currentColor" d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.6h7.6z" />
        </svg>
      </div>

      <div className="relative max-w-2xl space-y-3">
        {eyebrow && <div className="text-sm font-medium text-white">{eyebrow}</div>}
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-[40px]">{title}</h1>
        <p className="text-[15px] leading-relaxed text-white sm:text-base">{subtitle}</p>
      </div>

      {stats.length > 0 && (
        <dl className="relative mt-6 flex flex-wrap gap-2.5 sm:gap-3">
          {stats.map((s) => (
            <div key={s.label} className="min-w-[6.5rem] rounded-2xl border border-white/25 bg-white/12 px-4 py-2.5 backdrop-blur-sm">
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-xl font-bold leading-tight sm:text-2xl">
                <CountUp value={s.value} />
                {s.suffix}
              </dd>
              <dd aria-hidden className="text-xs font-medium text-white">
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
                "ripple press-fx group inline-flex h-11 items-center gap-2 overflow-hidden rounded-xl px-5 text-sm font-semibold transition-[background-color,box-shadow,transform] duration-200",
                a.primary
                  ? "bg-white text-[#1f1147] shadow-lg hover:shadow-xl"
                  : "border border-white/40 bg-white/10 text-white hover:bg-white/20",
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
