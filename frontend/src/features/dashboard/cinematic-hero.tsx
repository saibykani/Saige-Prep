"use client";

import { ArrowRight, Flame, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import { useRef, type CSSProperties, type PointerEvent } from "react";
import { CountUp } from "@/components/ui/count-up";
import type { StoreData } from "@/lib/store";

const DAY_MS = 86_400_000;

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Real counts per day for the last `days` days (oldest first) and the current streak, from the activity log. */
export function activityDays(activity: StoreData["activity"], today: Date, days = 14) {
  const counts = new Map<string, number>();
  for (const a of activity) {
    const k = dayKey(new Date(a.at));
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(today.getTime() - (days - 1 - i) * DAY_MS);
    return { label: d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" }), count: counts.get(dayKey(d)) ?? 0 };
  });
  // A streak survives until the end of today, so start counting from yesterday if today is still empty.
  let streak = 0;
  let cursor = counts.has(dayKey(today)) ? today : new Date(today.getTime() - DAY_MS);
  while (counts.has(dayKey(cursor))) {
    streak++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return { series, streak };
}

/** Readiness ring: an SVG arc that draws itself in and glows. */
function Ring({ pct }: { pct: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="cine-ring relative h-36 w-36 shrink-0 sm:h-44 sm:w-44">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="55%" stopColor="#f0abfc" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="9" />
        <circle
          className="cine-ring-arc"
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          style={{ "--ring-from": c, "--ring-to": c * (1 - pct / 100) } as CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-bold tracking-tight sm:text-5xl">
          <CountUp value={pct} />
          <span className="text-xl text-white/70">%</span>
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/65">ready</span>
      </div>
    </div>
  );
}

/**
 * Full-bleed "mission control" banner for the dashboard: deep animated backdrop, pointer parallax,
 * word-by-word headline, a readiness ring, the real study streak and a 14-day activity strip.
 * Every number comes from the learner's own saved data.
 */
export function CinematicHero({
  title,
  readiness,
  nextStep,
  activity,
  content,
}: {
  title: string;
  readiness: { done: number; total: number };
  nextStep?: { label: string; href: string };
  activity: StoreData["activity"];
  content: { tracks: number; lessons: number; hours: number };
}) {
  const ref = useRef<HTMLElement>(null);
  const { series, streak } = activityDays(activity, new Date());
  const max = Math.max(1, ...series.map((d) => d.count));
  const activeDays = series.filter((d) => d.count > 0).length;
  const pct = Math.round((readiness.done / readiness.total) * 100);

  function onMove(e: PointerEvent<HTMLElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const box = el.getBoundingClientRect();
    el.style.setProperty("--px", ((e.clientX - box.left) / box.width - 0.5).toFixed(3));
    el.style.setProperty("--py", ((e.clientY - box.top) / box.height - 0.5).toFixed(3));
  }
  function onLeave() {
    ref.current?.style.setProperty("--px", "0");
    ref.current?.style.setProperty("--py", "0");
  }

  return (
    <header
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="cine-hero relative isolate mb-8 overflow-hidden rounded-3xl px-5 py-8 text-white shadow-elevated sm:px-10 sm:py-11"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="cine-mesh absolute -inset-[20%]" />
        <div className="cine-grid absolute inset-0" />
        <div className="cine-orb cine-orb-a" />
        <div className="cine-orb cine-orb-b" />
        <div className="cine-orb cine-orb-c" />
        <div className="cine-beam absolute inset-y-0 w-1/3" />
        <div className="cine-stars absolute inset-0" />
        <div className="cine-vignette absolute inset-0" />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <p className="cine-chip mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
            </span>
            Your testing career HQ
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            {title.split(" ").map((w, i) => (
              <span key={i} className="cine-word inline-block" style={{ "--i": i } as CSSProperties}>
                {w}&nbsp;
              </span>
            ))}
          </h1>
          <p className="cine-sub mt-3 max-w-xl text-base text-white/80 sm:text-lg">
            Learn. Practice. Test. <span className="cine-shine font-semibold">Get hired.</span> Everything below reflects only what you have actually done.
          </p>

          {nextStep ? (
            <Link
              href={nextStep.href}
              className="cine-cta group mt-6 inline-flex max-w-full items-center gap-3 rounded-2xl bg-white py-2.5 pl-3 pr-4 text-[#1f1147] shadow-[0_10px_40px_-10px_rgb(240_171_252/0.7)] transition-transform hover:-translate-y-0.5 motion-reduce:transform-none"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                <Target className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-violet-600">Your next mission</span>
                <span className="block truncate text-sm font-semibold">{nextStep.label}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden />
            </Link>
          ) : (
            <Link
              href="/planner"
              className="cine-cta mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#1f1147]"
            >
              <Sparkles className="h-4 w-4" aria-hidden /> All starter missions done. Open your study plan
            </Link>
          )}

          <dl className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm">
            {[
              [content.tracks, "tracks"],
              [content.lessons, "lessons"],
              [content.hours, "hours of study"],
            ].map(([v, l]) => (
              <div key={l} className="flex items-baseline gap-1.5">
                <dt className="sr-only">{l}</dt>
                <dd className="text-2xl font-bold">
                  <CountUp value={v as number} />
                </dd>
                <span className="text-white/65">{l}</span>
              </div>
            ))}
          </dl>
        </div>

        <div className="cine-panel flex shrink-0 flex-col items-center gap-5 rounded-3xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-md sm:flex-row lg:flex-col xl:flex-row">
          <Ring pct={pct} />
          <div className="w-full min-w-[200px] space-y-4">
            <div className="flex items-center gap-3">
              <span className={`cine-flame flex h-10 w-10 items-center justify-center rounded-xl ${streak ? "bg-gradient-to-br from-amber-400 to-rose-500" : "bg-white/10"}`}>
                <Flame className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xl font-bold leading-none">
                  <CountUp value={streak} /> day{streak === 1 ? "" : "s"}
                </p>
                <p className="text-xs text-white/65">study streak</p>
              </div>
            </div>
            <div>
              <div className="flex h-14 items-end gap-1" role="img" aria-label={`Active on ${activeDays} of the last 14 days`}>
                {series.map((d, i) => (
                  <span
                    key={i}
                    title={`${d.label}: ${d.count} activit${d.count === 1 ? "y" : "ies"}`}
                    className={`cine-bar flex-1 rounded-sm ${d.count ? "bg-gradient-to-t from-violet-400 to-emerald-300" : "bg-white/12"}`}
                    style={{ height: `${d.count ? 18 + (d.count / max) * 82 : 10}%`, "--i": i } as CSSProperties}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-white/65">
                {readiness.done}/{readiness.total} starter missions · active {activeDays}/14 days
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
