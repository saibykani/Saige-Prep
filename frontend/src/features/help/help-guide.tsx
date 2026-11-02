import { ArrowRight, CalendarDays, CircleHelp, ListOrdered, Repeat } from "lucide-react";
import Link from "next/link";
import { FAQ, SAMPLE_WEEK, STUDY_LOOP, WALKTHROUGHS } from "./guide-data";
import { Callout, WalkthroughSection } from "./walkthrough";

const EXTRA_SECTIONS = [
  { id: "routine", title: "Recommended study routine" },
  { id: "faq", title: "FAQ" },
];

/** Sticky on large screens; a compact, collapsible list on small screens. */
function Contents() {
  const list = (
    <ol className="space-y-0.5 text-sm">
      {WALKTHROUGHS.map((w, i) => (
        <li key={w.id}>
          <a href={`#${w.id}`} className="flex gap-2 rounded-md px-2 py-1.5 text-muted hover:bg-surface-raised hover:text-foreground">
            <span className="w-5 shrink-0 text-right font-mono text-xs leading-5 text-subtle">{i + 1}</span>
            <span className="min-w-0">{w.title}</span>
          </a>
        </li>
      ))}
      {EXTRA_SECTIONS.map((s) => (
        <li key={s.id}>
          <a href={`#${s.id}`} className="flex gap-2 rounded-md px-2 py-1.5 text-muted hover:bg-surface-raised hover:text-foreground">
            <span className="w-5 shrink-0" aria-hidden />
            <span className="min-w-0">{s.title}</span>
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <details className="rounded-xl border border-border bg-surface p-3 lg:hidden">
        <summary className="cursor-pointer text-sm font-medium">Contents: {WALKTHROUGHS.length} walkthroughs</summary>
        <nav aria-label="Guide contents (compact)" className="mt-2">
          {list}
        </nav>
      </details>
      <nav aria-label="Guide contents" className="sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto pr-1 lg:block">
        <p className="mb-2 flex items-center gap-1.5 px-2 text-xs font-semibold tracking-wide text-muted uppercase">
          <ListOrdered className="h-3.5 w-3.5" aria-hidden /> On this page
        </p>
        {list}
      </nav>
    </>
  );
}

function Overview() {
  return (
    <section aria-labelledby="overview-title" className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
      <h2 id="overview-title" className="text-lg font-semibold tracking-tight">
        How to use this guide
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Each walkthrough below takes one part of Saige-Prep and goes through it step by step, with a screenshot of the
        real app at every step. Click any screenshot to enlarge it. New here? Do walkthroughs 1 to 4 in order today.
      </p>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {WALKTHROUGHS.slice(0, 4).map((w, i) => (
          <li key={w.id}>
            <a
              href={`#${w.id}`}
              className="group flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-sm hover:border-accent"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">{w.title}</span>
              <ArrowRight className="h-4 w-4 text-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />
            </a>
          </li>
        ))}
      </ol>
      <div className="mt-4">
        <Callout tone="note">
          There is no login. Everything you do is saved only in this browser, so export a backup regularly (walkthrough
          12).
        </Callout>
      </div>
    </section>
  );
}

function Routine() {
  return (
    <section id="routine" aria-labelledby="routine-title" className="scroll-mt-24 rounded-2xl border border-border bg-surface p-5 sm:p-7">
      <h2 id="routine-title" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
        <Repeat className="h-5 w-5 text-accent" aria-hidden /> Recommended study routine
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Every lesson is built for the same five-part loop. Use it every study session.
      </p>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STUDY_LOOP.map((s, i) => (
          <li key={s.title} className="rounded-xl border border-border bg-background/60 p-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
              {i + 1}
            </span>
            <p className="mt-3 font-semibold">{s.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{s.text}</p>
          </li>
        ))}
      </ol>

      <h3 className="mt-8 flex items-center gap-2 font-semibold">
        <CalendarDays className="h-4 w-4 text-accent" aria-hidden /> A sample week (about 6 hours)
      </h3>
      <div className="mt-3 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">A sample study week</caption>
          <thead className="bg-surface-raised text-xs text-muted uppercase">
            <tr>
              <th scope="col" className="px-4 py-2 font-semibold">
                Day
              </th>
              <th scope="col" className="hidden px-4 py-2 font-semibold sm:table-cell">
                Time
              </th>
              <th scope="col" className="px-4 py-2 font-semibold">
                What to do
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {SAMPLE_WEEK.map((b) => (
              <tr key={b.when} className="align-top">
                <th scope="row" className="px-4 py-3 font-medium whitespace-nowrap">
                  {b.when}
                  <span className="block text-xs font-normal text-muted sm:hidden">{b.minutes}</span>
                </th>
                <td className="hidden px-4 py-3 whitespace-nowrap text-muted sm:table-cell">{b.minutes}</td>
                <td className="px-4 py-3">
                  {b.what}{" "}
                  <Link href={b.href} className="font-medium whitespace-nowrap text-accent hover:underline">
                    Open →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Callout tone="tip">
          Little and often beats cramming: 45–60 focused minutes a day works better than one six-hour weekend. If you fall
          behind, generate a new plan with fewer hours rather than doubling up.
        </Callout>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-24 rounded-2xl border border-border bg-surface p-5 sm:p-7">
      <h2 id="faq-title" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
        <CircleHelp className="h-5 w-5 text-accent" aria-hidden /> FAQ
      </h2>
      <div className="mt-4 space-y-2">
        {FAQ.map((item) => (
          <details key={item.q} className="group rounded-lg border border-border bg-background/60 px-4 py-3 open:bg-surface-raised">
            <summary className="cursor-pointer list-none text-sm font-medium marker:hidden">
              <span className="mr-2 inline-block text-accent transition-transform group-open:rotate-90" aria-hidden>
                ›
              </span>
              {item.q}
            </summary>
            <p className="mt-2 pl-4 text-sm leading-6 text-muted">
              {item.a}
              {item.link && (
                <>
                  {" "}
                  <Link href={item.link.href} className="font-medium text-accent hover:underline">
                    {item.link.label} →
                  </Link>
                </>
              )}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function HelpGuide() {
  return (
    <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
      <div className="lg:self-stretch">
        <Contents />
      </div>
      <div className="min-w-0 space-y-6">
        <Overview />
        <h2 className="sr-only">Walkthroughs</h2>
        {WALKTHROUGHS.map((w, i) => (
          <WalkthroughSection key={w.id} walkthrough={w} number={i + 1} />
        ))}
        <Routine />
        <Faq />
      </div>
    </div>
  );
}
