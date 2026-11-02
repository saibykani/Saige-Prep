import { ArrowRight, Clock, Info, Lightbulb, TriangleAlert, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CalloutTone, HelpStep, Walkthrough } from "./guide-data";
import { Screenshot } from "./screenshot";

const CALLOUTS: Record<CalloutTone, { icon: LucideIcon; label: string; box: string; iconClass: string }> = {
  tip: { icon: Lightbulb, label: "Tip", box: "border-success/30 bg-success-soft/50", iconClass: "text-success" },
  note: { icon: Info, label: "Note", box: "border-accent/30 bg-accent-soft/50", iconClass: "text-accent" },
  warning: { icon: TriangleAlert, label: "Important", box: "border-warning/35 bg-warning-soft/60", iconClass: "text-warning" },
};

export function Callout({ tone, children }: { tone: CalloutTone; children: ReactNode }) {
  const c = CALLOUTS[tone];
  const Icon = c.icon;
  return (
    <div className={cn("flex gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm leading-6", c.box)}>
      <Icon className={cn("mt-1 h-4 w-4 shrink-0", c.iconClass)} aria-hidden />
      <p>
        <span className="font-semibold">{c.label}: </span>
        {children}
      </p>
    </div>
  );
}

function Step({ step, index, last, priority }: { step: HelpStep; index: number; last: boolean; priority: boolean }) {
  return (
    <li className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[2.25rem_minmax(0,1fr)]">
      {/* Timeline: numbered circle with a connecting line down to the next step. */}
      <div className="relative flex justify-center" aria-hidden>
        {!last && <span className="absolute top-9 bottom-0 w-px bg-gradient-to-b from-accent/50 to-border" />}
        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-accent bg-background text-sm font-semibold text-accent shadow-sm sm:h-9 sm:w-9">
          {index + 1}
        </span>
      </div>
      <div className={cn("min-w-0 space-y-3", last ? "pb-1" : "pb-10")}>
        <h4 className="pt-1 text-base font-semibold tracking-tight sm:pt-1.5">
          <span className="sr-only">Step {index + 1}: </span>
          {step.title}
        </h4>
        <p className="max-w-2xl text-sm leading-6 text-foreground/85">{step.body}</p>
        {step.callout && <Callout tone={step.callout.tone}>{step.callout.text}</Callout>}
        {step.link && (
          <Link href={step.link.href} className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
            Go to {step.link.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
        {step.image && (
          <div className="max-w-3xl pt-1">
            <Screenshot image={step.image} priority={priority} />
          </div>
        )}
      </div>
    </li>
  );
}

export function WalkthroughSection({ walkthrough, number }: { walkthrough: Walkthrough; number: number }) {
  const { id, title, summary, time, start, steps } = walkthrough;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 rounded-2xl border border-border bg-surface p-5 sm:p-7">
      <header className="mb-7 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <p className="text-xs font-semibold tracking-wider text-accent uppercase">
            Walkthrough {number} · {steps.length} steps
          </p>
          <h3 id={`${id}-title`} className="text-xl font-semibold tracking-tight">
            {title}
          </h3>
          <p className="max-w-2xl text-sm leading-6 text-muted">{summary}</p>
          {time && (
            <p className="inline-flex items-center gap-1.5 text-xs text-subtle">
              <Clock className="h-3.5 w-3.5" aria-hidden /> {time}
            </p>
          )}
        </div>
        <Link
          href={start.href}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-lg bg-accent px-3.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-strong"
        >
          {start.label} <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </header>
      <ol>
        {steps.map((step, i) => (
          <Step key={step.title} step={step} index={i} last={i === steps.length - 1} priority={number === 1 && i === 0} />
        ))}
      </ol>
    </section>
  );
}
