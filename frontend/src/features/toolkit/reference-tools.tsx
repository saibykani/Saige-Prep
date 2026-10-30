"use client";

import { ExternalLink, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Markdown } from "@/components/learning/markdown";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { GIT_SNIPPETS, HTTP_HEADERS, HTTP_STATUSES, RESOURCES, SQL_SNIPPETS, TEMPLATES } from "./reference-data";
import { CopyButton, DownloadButton, Segmented, ToolShell } from "./tool-ui";

function SearchBox({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="relative max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} aria-label={label} className="pl-9" />
    </div>
  );
}

const statusTone = (code: number) => (code < 300 ? "success" : code < 400 ? "neutral" : code < 500 ? "warning" : "danger");

export function HttpStatusTool() {
  const [q, setQ] = useState("");
  const list = HTTP_STATUSES.filter((s) => !q || `${s.code} ${s.name} ${s.meaning} ${s.testing}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <ToolShell local={false} title="HTTP status code reference" description="What each common status code means — and what to test for it.">
      <SearchBox value={q} onChange={setQ} label="Search codes, e.g. 401 or conflict" />
      <div className="grid gap-3 md:grid-cols-2">
        {list.map((s, i) => (
          <article key={s.code} style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }} className="animate-slide-up rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <Badge tone={statusTone(s.code)} className="font-mono text-sm">
                {s.code}
              </Badge>
              <h2 className="font-semibold">{s.name}</h2>
            </div>
            <p className="mt-2 text-sm leading-6">{s.meaning}</p>
            <p className="mt-1.5 text-sm leading-6 text-muted">
              <span className="font-medium text-accent">Test: </span>
              {s.testing}
            </p>
          </article>
        ))}
      </div>
    </ToolShell>
  );
}

export function HttpHeadersTool() {
  const [q, setQ] = useState("");
  const list = HTTP_HEADERS.filter((h) => !q || `${h.name} ${h.purpose} ${h.testing}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <ToolShell local={false} title="HTTP header reference" description="The headers testers check most: content negotiation, auth, caching, CORS and security.">
      <SearchBox value={q} onChange={setQ} label="Search headers" />
      <div className="space-y-2">
        {list.map((h) => (
          <article key={h.name} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-mono text-sm font-semibold">{h.name}</h2>
              <Badge>{h.direction}</Badge>
            </div>
            <p className="mt-1.5 text-sm leading-6">{h.purpose}</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              <span className="font-medium text-accent">Test: </span>
              {h.testing}
            </p>
          </article>
        ))}
      </div>
    </ToolShell>
  );
}

export function SqlCheatsheetTool() {
  return (
    <ToolShell local={false} title="SQL cheat sheet for testers" description="The queries you'll use daily to validate data. Practise them for real in the SQL lab.">
      <div className="grid gap-4 lg:grid-cols-2">
        {SQL_SNIPPETS.map((s) => (
          <article key={s.title} className="space-y-2 rounded-xl border border-border bg-surface p-4">
            <h2 className="font-semibold">{s.title}</h2>
            <CodeBlock code={s.sql} language="sql" />
            <p className="text-sm text-muted">{s.note}</p>
          </article>
        ))}
      </div>
    </ToolShell>
  );
}

export function GitCheatsheetTool() {
  return (
    <ToolShell local={false} title="Git command reference" description="Everyday Git for test engineers, from branching to finding the commit that broke a test.">
      <div className="grid gap-4 lg:grid-cols-2">
        {GIT_SNIPPETS.map((s) => (
          <article key={s.title} className="space-y-2 rounded-xl border border-border bg-surface p-4">
            <h2 className="font-semibold">{s.title}</h2>
            <CodeBlock code={s.cmd} language="bash" />
            <p className="text-sm text-muted">{s.note}</p>
          </article>
        ))}
      </div>
    </ToolShell>
  );
}

export function ResourcesTool() {
  return (
    <ToolShell local={false} title="Resource library" description="Curated links to official documentation only. They open in a new tab.">
      <div className="space-y-6">
        {RESOURCES.map((g) => (
          <section key={g.group} aria-labelledby={`res-${g.group}`}>
            <h2 id={`res-${g.group}`} className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle">
              {g.group}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lift group flex items-start gap-3 rounded-xl border border-border bg-surface p-3 hover:border-border-strong"
                >
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-subtle group-hover:text-accent" aria-hidden />
                  <span>
                    <span className="block text-sm font-medium group-hover:text-accent">{r.name}</span>
                    <span className="block text-xs leading-5 text-muted">{r.note}</span>
                  </span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </ToolShell>
  );
}

export function TemplatesTool() {
  const [active, setActive] = useState(TEMPLATES[0].slug);
  const [view, setView] = useState<"preview" | "markdown">("preview");
  const t = useMemo(() => TEMPLATES.find((x) => x.slug === active)!, [active]);
  return (
    <ToolShell local={false} title="QA templates" description="Ready-to-use Markdown templates. Copy them into your wiki or tracker, or download the .md file.">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Templates">
        {TEMPLATES.map((x) => (
          <button
            key={x.slug}
            type="button"
            role="tab"
            aria-selected={x.slug === active}
            onClick={() => setActive(x.slug)}
            className={cn("rounded-full border px-3 py-1.5 text-xs transition-colors", x.slug === active ? "border-accent bg-accent-soft" : "border-border text-muted hover:text-foreground")}
          >
            {x.title}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5" role="tabpanel">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <p className="mr-auto text-sm text-muted">{t.description}</p>
          <Segmented
            label="View"
            value={view}
            onChange={setView}
            options={[
              { value: "preview", label: "Preview" },
              { value: "markdown", label: "Markdown" },
            ]}
          />
          <CopyButton text={t.body} />
          <DownloadButton text={t.body} filename={`${t.slug}.md`} mime="text/markdown" />
        </div>
        {view === "preview" ? <Markdown source={t.body} /> : <CodeBlock code={t.body} language="markdown" />}
      </div>
    </ToolShell>
  );
}
