"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Alert, EmptyState, Skeleton } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { KIND_LABEL, searchDocs, type SearchKind } from "@/lib/search";
import { cn } from "@/lib/utils";
import { useSearchIndex } from "./use-search-index";

const KINDS = Object.keys(KIND_LABEL) as SearchKind[];
const TRACKS = [
  ["manual-testing", "Manual"],
  ["automation", "Automation"],
  ["api-testing", "API"],
  ["performance", "Performance"],
  ["mobile", "Mobile"],
  ["specialist", "Specialist"],
  ["sdet", "SDET"],
] as const;
const LEVELS = ["beginner", "intermediate", "advanced"] as const;
const DURATIONS = [
  [15, "≤ 15 min"],
  [30, "≤ 30 min"],
  [60, "≤ 1 hour"],
] as const;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        active ? "border-accent bg-accent-soft text-foreground" : "border-border text-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function SearchView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: docs, isPending, error } = useSearchIndex();

  const q = params.get("q") ?? "";
  const kind = (params.get("kind") as SearchKind | null) ?? undefined;
  const track = params.get("track") ?? undefined;
  const level = params.get("level") ?? undefined;
  const max = params.get("max") ? Number(params.get("max")) : undefined;

  function set(key: string, value: string | undefined) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const results = useMemo(
    () => (docs ? searchDocs(docs, q, { kinds: kind ? [kind] : undefined, track, level, maxMinutes: max }, 200) : []),
    [docs, q, kind, track, level, max],
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="Search" description="Search every lesson, role, interview question, practice exercise, project and tool." />
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
          <Input
            defaultValue={q}
            onChange={(e) => set("q", e.target.value || undefined)}
            placeholder="e.g. boundary values, JMeter correlation, SDET…"
            aria-label="Search query"
            className="h-11 pl-9"
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Type">
            <Chip active={!kind} onClick={() => set("kind", undefined)}>
              All types
            </Chip>
            {KINDS.map((k) => (
              <Chip key={k} active={kind === k} onClick={() => set("kind", kind === k ? undefined : k)}>
                {KIND_LABEL[k]}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Discipline">
            {TRACKS.map(([slug, label]) => (
              <Chip key={slug} active={track === slug} onClick={() => set("track", track === slug ? undefined : slug)}>
                {label}
              </Chip>
            ))}
            <span className="mx-1 w-px bg-border" aria-hidden />
            {LEVELS.map((l) => (
              <Chip key={l} active={level === l} onClick={() => set("level", level === l ? undefined : l)}>
                <span className="capitalize">{l}</span>
              </Chip>
            ))}
            <span className="mx-1 w-px bg-border" aria-hidden />
            {DURATIONS.map(([m, label]) => (
              <Chip key={m} active={max === m} onClick={() => set("max", max === m ? undefined : String(m))}>
                {label}
              </Chip>
            ))}
          </div>
        </div>

        {error ? (
          <Alert tone="error" title="Search is unavailable">
            {error.message}
          </Alert>
        ) : isPending ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState icon={Search} title="No results" description="Try fewer words or remove a filter." />
        ) : (
          <>
            <p className="text-sm text-muted" role="status">
              {results.length} result{results.length === 1 ? "" : "s"}
            </p>
            <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
              {results.map((doc) => (
                <li key={doc.id}>
                  <Link href={doc.href} className="block px-4 py-3 hover:bg-surface-raised">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="accent">{KIND_LABEL[doc.kind]}</Badge>
                      <span className="text-sm font-medium">{doc.title}</span>
                      {doc.level && <span className="text-xs capitalize text-muted">{doc.level}</span>}
                      {doc.minutes ? <span className="text-xs text-muted">{doc.minutes} min</span> : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{doc.text}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
