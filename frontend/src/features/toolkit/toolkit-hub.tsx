"use client";

import {
  ArrowRight,
  BookMarked,
  Braces,
  Calculator,
  Clock,
  Code,
  Combine,
  Database,
  FileCode2,
  FileText,
  GitBranch,
  Grid3x3,
  Library,
  ListTree,
  Regex,
  Shuffle,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { TOOLS, type ToolEntry } from "@/lib/registry";

const ICONS: Record<string, LucideIcon> = {
  json: Braces,
  xml: FileCode2,
  base64: Code,
  regex: Regex,
  timestamp: Clock,
  "test-data": Shuffle,
  bva: Calculator,
  equivalence: Grid3x3,
  pairwise: Combine,
  "http-status": ListTree,
  "http-headers": BookMarked,
  "sql-cheatsheet": Database,
  "git-cheatsheet": GitBranch,
  resources: Library,
  templates: FileText,
};

const GROUPS: ToolEntry["group"][] = ["Test design", "Data & encoding", "References", "Templates"];

export function ToolkitHub() {
  let n = 0;
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="QA Toolkit"
        description="Everyday utilities for testers. Data tools run entirely in your browser — still, avoid pasting confidential production data anywhere you don't control."
        eyebrow={<Badge tone="accent">{TOOLS.length} tools</Badge>}
      />
      <div className="space-y-8">
        {GROUPS.map((group) => (
          <section key={group} aria-labelledby={`grp-${group}`}>
            <h2 id={`grp-${group}`} className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-subtle">
              {group}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {TOOLS.filter((t) => t.group === group).map((tool) => {
                const Icon = ICONS[tool.slug] ?? Braces;
                return (
                  <Link
                    key={tool.slug}
                    href={`/toolkit/${tool.slug}`}
                    style={{ animationDelay: `${n++ * 30}ms` }}
                    className="lift animate-slide-up group flex items-start gap-3 rounded-xl border border-border bg-surface p-4 hover:border-border-strong"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-accent transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                        {tool.title}
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted">{tool.description}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
