import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { themeFor, type ThumbKind } from "@/lib/visual-themes";

/** Generated thumbnail: gradient + pattern + icon. Decorative only (aria-hidden). */
export function CourseThumb({
  themeKey,
  kind = "track",
  size = "md",
  className,
  children,
}: {
  themeKey: string;
  kind?: ThumbKind;
  size?: "sm" | "md";
  className?: string;
  children?: ReactNode;
}) {
  const theme = themeFor(themeKey, kind);
  const Icon: LucideIcon = theme.icon;
  const style = { "--c1": theme.from, "--c2": theme.via, "--c3": theme.to } as CSSProperties;
  return (
    <div className={cn("course-thumb relative overflow-hidden", size === "sm" ? "h-20" : "h-28", className)} style={style}>
      <div aria-hidden className={cn("thumb-zoom absolute inset-0", `thumb-pattern-${theme.pattern}`)}>
        <span className="absolute -right-6 -top-8 h-28 w-28 rounded-full border-[14px] border-white/10" />
        <span className="absolute -bottom-10 right-16 h-20 w-20 rounded-full bg-white/10" />
        <Icon
          className={cn("absolute text-white drop-shadow-sm", size === "sm" ? "bottom-3 left-3 h-7 w-7" : "bottom-4 left-5 h-10 w-10")}
          strokeWidth={1.6}
        />
        <Icon className="absolute -right-3 bottom-1 h-20 w-20 rotate-[-12deg] text-white/10" strokeWidth={1.2} />
      </div>
      {children}
    </div>
  );
}

export interface CourseCardProps {
  href: string;
  title: string;
  description?: string;
  themeKey: string;
  kind?: ThumbKind;
  /** Shown on the thumbnail, e.g. "Beginner – Advanced". */
  level?: string | null;
  /** Small text chips (counts and durations from real content). */
  meta?: ReactNode[];
  badges?: ReactNode;
  /** Usually a client component reading the learner store. */
  progress?: ReactNode;
  cta?: string;
  featured?: boolean;
  headingLevel?: "h2" | "h3";
}

/** Marketplace-style card: coloured thumbnail, level, meta, progress and a hover CTA reveal. */
export function CourseCard({
  href,
  title,
  description,
  themeKey,
  kind = "track",
  level,
  meta = [],
  badges,
  progress,
  cta = "Start learning",
  featured = false,
  headingLevel: Heading = "h2",
}: CourseCardProps) {
  const card = (
    <Link
      href={href}
      className={cn(
        "course-card spotlight group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft",
        featured && "border-transparent",
      )}
    >
      <CourseThumb themeKey={themeKey} kind={kind}>
        {level && (
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-[#14211f] shadow-sm">
            {level}
          </span>
        )}
        <span className="course-cta absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#14211f] shadow-md">
          {cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </CourseThumb>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <Heading className="font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent">{title}</Heading>
          {description && <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{description}</p>}
        </div>
        {(meta.length > 0 || badges) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
            {meta.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {i > 0 && <span aria-hidden className="mr-2 h-1 w-1 rounded-full bg-border-strong" />}
                {m}
              </span>
            ))}
            {badges}
          </div>
        )}
        {progress && <div className="mt-auto pt-1">{progress}</div>}
      </div>
    </Link>
  );
  return featured ? <div className="featured-ring h-full rounded-2xl">{card}</div> : card;
}
