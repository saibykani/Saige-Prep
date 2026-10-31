"use client";

import { ArrowRight, Bug, ClipboardCheck, CodeXml, Database, FileSearch, Gauge, Sparkles, Webhook, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { PRACTICE } from "@/lib/registry";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { API_CHALLENGES } from "./mock-api";
import { CODE_CHALLENGES } from "./code-challenges";
import { DEFECT_EXERCISES, REQUIREMENTS_EXERCISES } from "./manual-labs-data";
import { PERF_EXERCISES } from "./performance-data";
import { SQL_EXERCISES } from "./sql-data";
import { DESIGN_EXERCISES } from "./test-design-data";

const LABS: Record<string, { icon: LucideIcon; ids: string[]; tint: string; checked: "auto" | "self" }> = {
  "test-design": { icon: ClipboardCheck, ids: DESIGN_EXERCISES.map((e) => e.id), tint: "from-[#a394f5]/25", checked: "auto" },
  requirements: { icon: FileSearch, ids: REQUIREMENTS_EXERCISES.map((e) => e.id), tint: "from-[#9cc9e8]/20", checked: "self" },
  "defect-report": { icon: Bug, ids: DEFECT_EXERCISES.map((e) => e.id), tint: "from-[#ef6f6c]/20", checked: "self" },
  code: { icon: CodeXml, ids: CODE_CHALLENGES.map((e) => e.id), tint: "from-[#e0b25a]/20", checked: "auto" },
  api: { icon: Webhook, ids: API_CHALLENGES.map((e) => e.id), tint: "from-[#4fbf8f]/20", checked: "auto" },
  sql: { icon: Database, ids: SQL_EXERCISES.map((e) => e.id), tint: "from-[#c9befc]/20", checked: "auto" },
  performance: { icon: Gauge, ids: PERF_EXERCISES.map((e) => e.id), tint: "from-[#f39a98]/20", checked: "auto" },
};

export function PracticeHub() {
  const practice = useStore((d) => d.practice);
  const total = Object.values(LABS).reduce((n, l) => n + l.ids.length, 0);
  const solved = Object.entries(LABS).reduce((n, [lab, l]) => n + l.ids.filter((id) => practice[`${lab}:${id}`]).length, 0);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Practice Lab"
        description="Learn by doing. Short, hands-on exercises with instant feedback — and an explanation every time, so mistakes turn into understanding."
        eyebrow={
          <Badge tone="accent">
            <Sparkles className="h-3 w-3" aria-hidden /> {solved * 10} XP · {solved}/{total} solved
          </Badge>
        }
      />
      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PRACTICE.map((p) => {
          const lab = LABS[p.slug];
          if (!lab) return null;
          const Icon = lab.icon;
          const done = lab.ids.filter((id) => practice[`${p.slug}:${id}`]).length;
          const pct = Math.round((done / lab.ids.length) * 100);
          return (
            <Link
              key={p.slug}
              href={`/practice/${p.slug}`}
              className={cn(
                "spotlight lift group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-5 hover:border-border-strong",
              )}
            >
              <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent opacity-70 transition-opacity group-hover:opacity-100", lab.tint)} aria-hidden />
              <div className="relative flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background/70 text-accent transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <Badge>{p.area}</Badge>
              </div>
              <div className="relative">
                <h2 className="font-semibold tracking-tight">{p.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted">{p.description}</p>
              </div>
              <div className="relative mt-auto space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>
                    {done}/{lab.ids.length} · {lab.checked === "auto" ? "auto-checked" : "self-reviewed"}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-foreground transition-transform group-hover:translate-x-0.5">
                    {done === 0 ? "Start" : done === lab.ids.length ? "Review" : "Continue"} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent to-success transition-[width] duration-700" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
