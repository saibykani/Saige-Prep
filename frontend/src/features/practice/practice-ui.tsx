"use client";

import { ArrowLeft, CircleCheck, CircleDashed, Lightbulb, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { actions, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const practiceKey = (lab: string, id: string) => `${lab}:${id}`;

export function usePracticeDone(lab: string) {
  const practice = useStore((d) => d.practice);
  return (id: string) => Boolean(practice[practiceKey(lab, id)]);
}

export function markPracticeDone(lab: string, id: string, score?: number) {
  actions.completePractice(practiceKey(lab, id), score);
}

export interface ExerciseItem {
  id: string;
  title: string;
  level?: "beginner" | "intermediate" | "advanced";
}

/** Page frame for a lab: header with progress, exercise picker (sidebar on desktop, chips on mobile), content. */
export function LabShell({
  lab,
  title,
  description,
  icon: Icon,
  exercises,
  activeId,
  onSelect,
  children,
  aside,
}: {
  lab: string;
  title: string;
  description: string;
  icon: LucideIcon;
  exercises: ExerciseItem[];
  activeId: string;
  onSelect: (id: string) => void;
  children: ReactNode;
  aside?: ReactNode;
}) {
  const isDone = usePracticeDone(lab);
  const done = exercises.filter((e) => isDone(e.id)).length;
  const pct = exercises.length ? Math.round((done / exercises.length) * 100) : 0;
  const currentStreak = useStreak();

  return (
    <div className="animate-fade-in">
      <Link href="/practice" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Practice Lab
      </Link>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent-soft text-accent">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 self-start rounded-xl border border-border bg-surface px-4 py-2.5 sm:self-auto">
          <div
            className="relative"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${title} progress`}
          >
            <ProgressRing value={pct / 100} />
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold">{pct}%</span>
          </div>
          <div className="text-xs leading-5">
            <p className="font-medium text-foreground">
              {done}/{exercises.length} solved
            </p>
            <p key={currentStreak} className={cn("text-muted", currentStreak > 1 && "animate-pop text-warning")}>
              {currentStreak > 1 ? `🔥 ${currentStreak} in a row` : done === exercises.length && done > 0 ? "🏆 Lab complete!" : "Let's go!"}
            </p>
          </div>
        </div>
      </header>

      {/* Mobile: horizontal exercise chips */}
      <nav aria-label="Exercises" className="-mx-4 mb-5 overflow-x-auto px-4 lg:hidden">
        <ol className="flex w-max gap-2">
          {exercises.map((e, i) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onSelect(e.id)}
                aria-current={e.id === activeId ? "step" : undefined}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors",
                  e.id === activeId ? "border-accent bg-accent-soft text-foreground" : "border-border text-muted",
                )}
              >
                {isDone(e.id) ? <CircleCheck className="h-3.5 w-3.5 text-success" aria-label="Completed" /> : <span className="font-mono text-[10px] text-subtle">{i + 1}</span>}
                {e.title}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav aria-label="Exercises" className="sticky top-20 space-y-4">
            <ol className="space-y-0.5">
              {exercises.map((e, i) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(e.id)}
                    aria-current={e.id === activeId ? "step" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                      e.id === activeId ? "bg-accent-soft text-foreground" : "text-muted hover:bg-surface-raised hover:text-foreground",
                    )}
                  >
                    {isDone(e.id) ? (
                      <CircleCheck className="h-4 w-4 shrink-0 text-success" aria-label="Completed" />
                    ) : (
                      <CircleDashed className="h-4 w-4 shrink-0 text-subtle" aria-label="Not completed" />
                    )}
                    <span className="min-w-0 flex-1 truncate">
                      <span className="mr-1.5 font-mono text-[11px] text-subtle">{i + 1}.</span>
                      {e.title}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            {aside}
          </nav>
        </aside>
        <div className="min-w-0 space-y-5">{children}</div>
      </div>
    </div>
  );
}

export function ExerciseHeader({ title, level, children }: { title: string; level?: string; children?: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {level && (
          <Badge tone={level === "advanced" ? "danger" : level === "intermediate" ? "warning" : "success"} className="capitalize">
            {level}
          </Badge>
        )}
      </div>
      {children && <div className="text-[15px] leading-7 text-foreground/90">{children}</div>}
    </div>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Lightbulb className="h-3.5 w-3.5 text-warning" aria-hidden />
        {open ? "Hide hint" : "Show hint"}
      </Button>
      {open && <div className="mt-2 rounded-lg border border-warning/25 bg-warning-soft/50 px-4 py-3 text-sm leading-6">{children}</div>}
    </div>
  );
}

const CONFETTI_COLORS = ["#a394f5", "#4fbf8f", "#e0b25a", "#ef6f6c", "#9cc9e8", "#c9befc"];

/** CSS-only confetti burst (transform/opacity animations; hidden for reduced motion). */
export function Confetti({ pieces = 16 }: { pieces?: number }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      {Array.from({ length: pieces }, (_, i) => {
        const angle = (i / pieces) * Math.PI * 2;
        const distance = 70 + (i % 4) * 22;
        return (
          <span
            key={i}
            className="confetti-piece"
            style={
              {
                background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                "--dx": `${Math.cos(angle) * distance}px`,
                "--dy": `${Math.sin(angle) * distance - 20}px`,
                "--rot": `${(i % 2 ? 1 : -1) * (180 + i * 25)}deg`,
                animationDelay: `${(i % 3) * 30}ms`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </span>
  );
}

const PRAISE = ["Nailed it!", "Spot on!", "That's it!", "Great testing instinct!", "Correct — nicely done!"];
const NUDGE = ["Not quite yet", "Close — have another look", "Almost there"];

/**
 * Feedback after a check. Correct answers celebrate (confetti, +XP, drawn check mark);
 * wrong answers shake gently and explain what to look at next.
 */
export function Verdict({ ok, children, xp = 10, attempt = 0 }: { ok: boolean; children: ReactNode; xp?: number; attempt?: number }) {
  const title = ok ? PRAISE[attempt % PRAISE.length] : NUDGE[attempt % NUDGE.length];
  return (
    <div
      key={`${ok}-${attempt}`}
      role="status"
      className={cn(
        "relative flex gap-3 rounded-xl border px-4 py-3 text-sm leading-6",
        ok ? "animate-pop border-success/35 bg-success-soft" : "animate-shake border-danger/30 bg-danger-soft",
      )}
    >
      {ok && (
        <>
          <Confetti />
          <span className="xp-float rounded-full bg-success px-2 py-0.5 text-xs font-bold text-success-foreground">+{xp} XP</span>
        </>
      )}
      <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full", ok ? "bg-success text-success-foreground" : "bg-danger text-white")}>
        {ok ? (
          <svg viewBox="0 0 24 24" className="check-draw h-4 w-4" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="text-sm font-bold" aria-hidden>
            !
          </span>
        )}
      </span>
      <div className="min-w-0">
        <p className={cn("font-semibold", ok ? "text-success" : "text-danger")}>{title}</p>
        <div className="text-foreground/85">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------- session streak (correct in a row) ------------------------- */

let streak = 0;
const streakListeners = new Set<() => void>();
const emitStreak = () => streakListeners.forEach((l) => l());

/** Record a check result; returns the new streak. Correct answers grow it, mistakes reset it. */
export function recordAttempt(correct: boolean) {
  streak = correct ? streak + 1 : 0;
  emitStreak();
  return streak;
}

function useStreak() {
  return useSyncExternalStore(
    (l) => {
      streakListeners.add(l);
      return () => streakListeners.delete(l);
    },
    () => streak,
    () => 0,
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 44 44" className="h-12 w-12 -rotate-90" aria-hidden>
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--surface-raised)" strokeWidth="5" />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="url(#ring)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value)}
        style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
      <defs>
        <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a394f5" />
          <stop offset="1" stopColor="#4fbf8f" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function NextButton({ ids, activeId, onSelect }: { ids: string[]; activeId: string; onSelect: (id: string) => void }) {
  const i = ids.indexOf(activeId);
  if (i === -1 || i === ids.length - 1) return null;
  return (
    <Button variant="secondary" size="sm" onClick={() => onSelect(ids[i + 1])}>
      Next exercise →
    </Button>
  );
}

/** Shared surface for an exercise. */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-xl border border-border bg-surface p-4 sm:p-5", className)}>{children}</section>;
}
