import {
  Accessibility,
  Bot,
  Braces,
  BrainCircuit,
  Bug,
  ClipboardCheck,
  Container,
  Database,
  Drama,
  Gauge,
  GitBranch,
  Globe,
  Network,
  ShieldCheck,
  Smartphone,
  TestTubeDiagonal,
  Webhook,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { TestRunTerminal } from "./test-run-terminal";

interface Chip {
  label: string;
  icon: LucideIcon;
  /** Position inside the hero, in % of its box. */
  top: number;
  left: number;
  tone: "violet" | "emerald" | "amber" | "rose" | "sky";
  dur: number;
  delay: number;
  tilt: number;
  /** Hide on small screens to keep the mobile layout calm. */
  desktopOnly?: boolean;
}

// Tool names are shown as plain text labels (no third-party logos).
const CHIPS: Chip[] = [
  // Left margin column
  { label: "Selenium", icon: Globe, top: 5, left: 3, tone: "emerald", dur: 9, delay: 0, tilt: -4 },
  { label: "axe a11y", icon: Accessibility, top: 21, left: 2, tone: "violet", dur: 10.5, delay: 1, tilt: 2, desktopOnly: true },
  { label: "SQL", icon: Database, top: 36, left: 4, tone: "amber", dur: 10, delay: 3, tilt: 3, desktopOnly: true },
  { label: "Appium", icon: Smartphone, top: 51, left: 2, tone: "violet", dur: 10.5, delay: 0.4, tilt: 4 },
  { label: "Microservices", icon: Network, top: 66, left: 1, tone: "sky", dur: 13, delay: 3.6, tilt: 3, desktopOnly: true },
  { label: "Git", icon: GitBranch, top: 81, left: 4, tone: "emerald", dur: 9, delay: 2.4, tilt: 4, desktopOnly: true },
  // Right margin column
  { label: "Postman", icon: Webhook, top: 6, left: 82, tone: "amber", dur: 10, delay: 0.6, tilt: 5 },
  { label: "Cypress", icon: Bot, top: 22, left: 85, tone: "sky", dur: 13, delay: 2.6, tilt: -5, desktopOnly: true },
  { label: "JMeter", icon: Gauge, top: 38, left: 83, tone: "rose", dur: 12, delay: 2.1, tilt: -2, desktopOnly: true },
  { label: "Docker", icon: Container, top: 54, left: 85, tone: "sky", dur: 11, delay: 0.2, tilt: 3, desktopOnly: true },
  { label: "Cucumber BDD", icon: ClipboardCheck, top: 70, left: 81, tone: "emerald", dur: 14, delay: 0.7, tilt: 2, desktopOnly: true },
  { label: "TestNG", icon: TestTubeDiagonal, top: 85, left: 84, tone: "emerald", dur: 11.5, delay: 0.9, tilt: 2 },
  // Top and bottom bands
  { label: "Playwright", icon: Drama, top: 2, left: 38, tone: "violet", dur: 11, delay: 1.2, tilt: 3 },
  { label: "OWASP ZAP", icon: ShieldCheck, top: 3, left: 60, tone: "rose", dur: 13.5, delay: 3.4, tilt: -3, desktopOnly: true },
  { label: "RestAssured", icon: Braces, top: 94, left: 24, tone: "sky", dur: 9.5, delay: 1.8, tilt: -3 },
  { label: "JIRA", icon: Bug, top: 95, left: 46, tone: "amber", dur: 12, delay: 2.9, tilt: -4, desktopOnly: true },
  { label: "LLM evals", icon: BrainCircuit, top: 93, left: 62, tone: "violet", dur: 12, delay: 4, tilt: -2, desktopOnly: true },
  { label: "Jenkins", icon: Workflow, top: 96, left: 12, tone: "rose", dur: 12.5, delay: 1.5, tilt: -2, desktopOnly: true },
];

const toneClass: Record<Chip["tone"], string> = {
  violet: "text-[#b9adf8] border-[#a394f5]/30 shadow-[#a394f5]/10",
  emerald: "text-[#7fd6b0] border-[#4fbf8f]/30 shadow-[#4fbf8f]/10",
  amber: "text-[#ecc77f] border-[#e0b25a]/30 shadow-[#e0b25a]/10",
  rose: "text-[#f39a98] border-[#ef6f6c]/30 shadow-[#ef6f6c]/10",
  sky: "text-[#9cc9e8] border-[#7fb3d8]/30 shadow-[#7fb3d8]/10",
};

export function FloatingTools({ dense = true }: { dense?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {CHIPS.filter((chip) => dense || !chip.desktopOnly).map((chip) => {
        const Icon = chip.icon;
        return (
          <span
            key={chip.label}
            className={`float-chip absolute inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-[#141417]/80 px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-sm ${toneClass[chip.tone]} ${chip.desktopOnly ? "hidden xl:inline-flex" : ""}`}
            style={
              {
                top: `${chip.top}%`,
                left: `${chip.left}%`,
                "--dur": `${chip.dur}s`,
                "--delay": `-${chip.delay}s`,
                "--tilt": `${chip.tilt}deg`,
              } as CSSProperties
            }
          >
            <Icon className="h-3.5 w-3.5" />
            {chip.label}
          </span>
        );
      })}
    </div>
  );
}

export function AuroraBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="grid-backdrop absolute inset-0" />
      <div
        className="aurora-blob absolute -left-24 top-[-10%] h-[28rem] w-[28rem] rounded-full bg-[#7c6cf0]/35"
        style={{ "--dur": "18s" } as CSSProperties}
      />
      <div
        className="aurora-blob absolute bottom-[-15%] right-[-10%] h-[26rem] w-[26rem] rounded-full bg-[#2f9e74]/25"
        style={{ "--dur": "22s", "--delay": "-6s" } as CSSProperties}
      />
      <div
        className="aurora-blob absolute left-[40%] top-[35%] h-72 w-72 rounded-full bg-[#c56cf0]/15"
        style={{ "--dur": "26s", "--delay": "-11s" } as CSSProperties}
      />
    </div>
  );
}

const DISCIPLINES = ["Manual QA", "Automation", "API", "Performance", "Mobile", "Security", "SDET", "AI testing"];

export function LoginHero() {
  return (
    <section className="relative hidden min-h-screen flex-1 flex-col justify-center overflow-hidden border-r border-border/60 px-12 py-16 lg:flex xl:px-20">
      <FloatingTools />
      <div className="relative z-10 mx-auto w-full max-w-xl">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-muted backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Your private QA &amp; SDET training ground
        </p>
        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight xl:text-6xl">
          <span className="bg-gradient-to-br from-white via-white to-white/50 bg-clip-text text-transparent">Learn. Practice.</span>
          <br />
          <span className="bg-gradient-to-r from-[#b9adf8] via-[#a394f5] to-[#4fbf8f] bg-clip-text text-transparent">
            Test. Get Hired.
          </span>
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
          From boundary values to distributed load tests: study every testing discipline, run real exercises and
          rehearse the interview.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {DISCIPLINES.map((d) => (
            <li key={d} className="rounded-md border border-border bg-surface/60 px-2.5 py-1 text-xs text-muted backdrop-blur">
              {d}
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <TestRunTerminal />
        </div>
      </div>
    </section>
  );
}
