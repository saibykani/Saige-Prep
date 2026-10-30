"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { actions, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface RoleCard {
  slug: string;
  title: string;
  category: string;
  overview: string;
  essential: string[];
  codingRequired: boolean;
}

export function RoleCatalogue({ roles, categories }: { roles: RoleCard[]; categories: { id: string; label: string }[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const targetRole = useStore((d) => d.profile.targetRole);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roles.filter(
      (r) =>
        (category === "all" || r.category === category) &&
        (!q || [r.title, r.overview, ...r.essential].some((text) => text.toLowerCase().includes(q))),
    );
  }, [roles, query, category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roles or skills…"
            aria-label="Search roles"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          {[{ id: "all", label: "All" }, ...categories].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                category === c.id ? "border-accent bg-accent-soft text-foreground" : "border-border text-muted hover:text-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted" role="status">
        {filtered.length} role{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="No roles match" description="Try a different search or category." />
      ) : (
        categories
          .filter((c) => filtered.some((r) => r.category === c.id))
          .map((c) => (
            <section key={c.id} aria-labelledby={`cat-${c.id}`}>
              <h2 id={`cat-${c.id}`} className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-subtle">
                {c.label}
              </h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filtered
                  .filter((r) => r.category === c.id)
                  .map((role) => (
                    <Link
                      key={role.slug}
                      href={`/roadmaps/${role.slug}`}
                      className={cn(
                        "group flex flex-col gap-2 rounded-xl border bg-surface p-4 transition-colors hover:border-border-strong hover:bg-surface-raised",
                        targetRole === role.slug ? "border-accent" : "border-border",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold">{role.title}</h3>
                        <ArrowRight className="h-4 w-4 shrink-0 text-subtle group-hover:text-accent" aria-hidden />
                      </div>
                      <p className="line-clamp-3 text-xs leading-5 text-muted">{role.overview}</p>
                      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                        {targetRole === role.slug && <Badge tone="accent">Your target</Badge>}
                        <Badge tone={role.codingRequired ? "warning" : "success"}>{role.codingRequired ? "Coding required" : "No coding required"}</Badge>
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          ))
      )}
    </div>
  );
}

export function SetTargetRole({ slug, title }: { slug: string; title: string }) {
  const targetRole = useStore((d) => d.profile.targetRole);
  const active = targetRole === slug;
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => actions.setProfile({ targetRole: active ? undefined : slug, onboardedAt: new Date().toISOString() })}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors",
        active ? "border border-accent bg-accent-soft text-foreground" : "bg-accent text-[#0d0b1a] hover:bg-accent-strong",
      )}
      title={active ? `Stop targeting ${title}` : `Make ${title} your target role`}
    >
      {active ? "✓ Your target role" : "Set as my target role"}
    </button>
  );
}
