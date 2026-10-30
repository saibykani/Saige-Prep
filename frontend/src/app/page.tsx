import { ArrowRight, Bot, ClipboardCheck, Gauge, MessagesSquare, Webhook } from "lucide-react";
import Link from "next/link";

const PILLARS = [
  { icon: ClipboardCheck, label: "Manual QA", text: "Test design, documentation and defect management as a first-class path." },
  { icon: Bot, label: "Automation", text: "Java, Selenium, TestNG, Playwright and framework architecture." },
  { icon: Webhook, label: "API", text: "HTTP, Postman, RestAssured and contract testing." },
  { icon: Gauge, label: "Performance", text: "Workload models, percentiles and JMeter analysis." },
  { icon: MessagesSquare, label: "Interviews", text: "Role-specific mock interviews with transparent rubrics." },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <div className="animate-fade-in space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
          Private learning platform
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Saige-Prep
          <span className="mt-2 block text-muted">Learn. Practice. Test. Get Hired.</span>
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          A complete path through software testing: every major discipline, hands-on practice, timed assessments and
          mock interviews, with progress measured from what you actually do.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-strong"
        >
          Continue to Saige-Prep
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <ul className="mt-16 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
        {PILLARS.map(({ icon: Icon, label, text }) => (
          <li key={label} className="bg-surface p-5">
            <Icon className="h-5 w-5 text-accent" aria-hidden />
            <p className="mt-3 text-sm font-medium">{label}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{text}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
