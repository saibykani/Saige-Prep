"use client";

import { KeyRound, Plus, RotateCcw, Send, Webhook, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { API_CHALLENGES, createMockApi, type ExchangeLog, type MockResponse } from "./mock-api";
import { ExerciseHeader, Hint, LabShell, markPracticeDone, NextButton, Panel, recordAttempt, usePracticeDone, Verdict } from "./practice-ui";

const METHODS = ["GET", "POST", "PUT", "DELETE"] as const;
const METHOD_COLOR: Record<string, string> = {
  GET: "text-success",
  POST: "text-warning",
  PUT: "text-sky-700 dark:text-[#9cc9e8]",
  DELETE: "text-danger",
};

function statusTone(status: number) {
  if (status < 300) return "bg-success-soft text-success border-success/30";
  if (status < 400) return "bg-surface-raised text-muted border-border";
  if (status < 500) return "bg-warning-soft text-warning border-warning/30";
  return "bg-danger-soft text-danger border-danger/30";
}

/** Starter requests that set up the shape of each challenge without solving the thinking part. */
const STARTERS: Record<string, { method: string; path: string; body?: string; json?: boolean }> = {
  "api-01": { method: "GET", path: "/health" },
  "api-02": { method: "GET", path: "/products/1" },
  "api-03": { method: "GET", path: "/products/1" },
  "api-04": { method: "GET", path: "/products" },
  "api-05": { method: "GET", path: "/products" },
  "api-06": { method: "POST", path: "/auth/token", body: '{\n  "username": "tester",\n  "password": ""\n}', json: true },
  "api-07": { method: "POST", path: "/auth/token", body: '{\n  "username": "tester",\n  "password": ""\n}', json: true },
  "api-08": { method: "POST", path: "/products", body: '{\n  "sku": "KB-101",\n  "name": "Compact Keyboard",\n  "category": "accessories",\n  "price": 59\n}', json: true },
};

interface HeaderRow {
  key: string;
  value: string;
}

export function ApiLab() {
  const api = useRef(createMockApi());
  const [activeId, setActiveId] = useState(API_CHALLENGES[0].id);
  const [method, setMethod] = useState<string>("GET");
  const [path, setPath] = useState("/health");
  const [headers, setHeaders] = useState<HeaderRow[]>([{ key: "Accept", value: "application/json" }]);
  const [body, setBody] = useState("");
  const [history, setHistory] = useState<ExchangeLog[]>([]);
  const [last, setLast] = useState<{ res: MockResponse; ms: number } | null>(null);
  const [justCompleted, setJustCompleted] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);
  const isDone = usePracticeDone("api");
  const { notify } = useToast();

  const challenge = API_CHALLENGES.find((c) => c.id === activeId)!;
  const lastToken = useMemo(() => {
    for (let i = history.length - 1; i >= 0; i--) {
      const b = history[i].response.body as { access_token?: string } | null;
      if (b?.access_token) return b.access_token;
    }
    return null;
  }, [history]);

  function select(id: string) {
    setActiveId(id);
    setJustCompleted([]);
  }

  function loadStarter() {
    const s = STARTERS[challenge.id];
    if (!s) return;
    setMethod(s.method);
    setPath(s.path);
    setBody(s.body ?? "");
    if (s.json && !headers.some((h) => h.key.toLowerCase() === "content-type")) {
      setHeaders((h) => [...h, { key: "Content-Type", value: "application/json" }]);
    }
  }

  function applyToken() {
    if (!lastToken) return;
    setHeaders((h) => [...h.filter((x) => x.key.toLowerCase() !== "authorization"), { key: "Authorization", value: `Bearer ${lastToken}` }]);
    notify("Authorization header added", "success");
  }

  function send() {
    const request = {
      method,
      path: path.trim() || "/",
      headers: Object.fromEntries(headers.filter((h) => h.key.trim()).map((h) => [h.key.trim(), h.value])),
      body: method === "GET" || method === "DELETE" ? undefined : body,
    };
    const started = performance.now();
    const response = api.current.handle(request);
    const ms = Math.max(1, Math.round(performance.now() - started + 18 + Math.random() * 30));
    const nextHistory = [...history, { request, response }].slice(-200);
    setHistory(nextHistory);
    setLast({ res: response, ms });

    const newly = API_CHALLENGES.filter((c) => !isDone(c.id) && c.check(nextHistory)).map((c) => c.id);
    newly.forEach((id) => markPracticeDone("api", id));
    if (newly.length) {
      recordAttempt(true);
      setAttempt((a) => a + 1);
    }
    setJustCompleted(newly);
  }

  function resetServer() {
    api.current.reset();
    setHistory([]);
    setLast(null);
    setJustCompleted([]);
    notify("Mock API data reset", "info");
  }

  const completedTitles = justCompleted.map((id) => API_CHALLENGES.find((c) => c.id === id)?.title).filter(Boolean);

  return (
    <LabShell
      lab="api"
      title="API lab"
      description="A safe practice API that runs in your browser — no internet calls, nothing to break. Send real HTTP requests, read the responses like a tester, and complete each challenge."
      icon={Webhook}
      exercises={API_CHALLENGES}
      activeId={activeId}
      onSelect={select}
      aside={
        <div className="space-y-2 rounded-xl border border-border bg-surface p-3 text-xs leading-5 text-muted">
          <p className="font-semibold uppercase tracking-wider text-subtle">Test accounts</p>
          <p>
            <span className="font-mono text-foreground">tester</span> / <span className="font-mono">Test@123</span> (user)
          </p>
          <p>
            <span className="font-mono text-foreground">admin</span> / <span className="font-mono">Admin@123</span> (admin)
          </p>
        </div>
      }
    >
      <Panel>
        <ExerciseHeader title={challenge.title} level={challenge.level}>
          {challenge.task}
        </ExerciseHeader>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {isDone(challenge.id) && <Badge tone="success">✓ Completed</Badge>}
          <Hint>{challenge.hint}</Hint>
          {STARTERS[challenge.id] && (
            <Button variant="ghost" size="sm" onClick={loadStarter}>
              Load starter request
            </Button>
          )}
        </div>
      </Panel>

      {completedTitles.length > 0 && (
        <Verdict ok attempt={attempt} xp={15 * completedTitles.length}>
          Challenge complete: <strong>{completedTitles.join(", ")}</strong>.
        </Verdict>
      )}
      {completedTitles.length > 0 && <NextButton ids={API_CHALLENGES.map((c) => c.id)} activeId={activeId} onSelect={select} />}

      <Panel className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="api-method" className="sr-only">
            Method
          </label>
          <select
            id="api-method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={cn("h-10 rounded-lg border border-border bg-background px-3 font-mono text-sm font-semibold focus-visible:border-accent focus-visible:outline-none", METHOD_COLOR[method])}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <div className="flex min-w-0 flex-1 items-center rounded-lg border border-border bg-background focus-within:border-accent">
            <span className="hidden pl-3 font-mono text-xs text-subtle sm:inline">mock.saige-prep</span>
            <label htmlFor="api-path" className="sr-only">
              Path
            </label>
            <input
              id="api-path"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              spellCheck={false}
              className="h-10 min-w-0 flex-1 bg-transparent px-2 font-mono text-sm outline-none"
            />
          </div>
          <Button onClick={send} className="justify-center">
            <Send className="h-4 w-4" aria-hidden /> Send
          </Button>
        </div>

        <fieldset className="space-y-2">
          <legend className="mb-1 flex items-center gap-2 text-sm font-medium">
            Headers
            {lastToken && (
              <Button variant="ghost" size="sm" onClick={applyToken} type="button">
                <KeyRound className="h-3.5 w-3.5 text-accent" aria-hidden /> Use this token
              </Button>
            )}
          </legend>
          {headers.map((h, i) => (
            <div key={i} className="flex gap-2">
              <Input aria-label="Header name" value={h.key} onChange={(e) => setHeaders((all) => all.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)))} className="h-9 font-mono text-xs sm:w-48" />
              <Input aria-label="Header value" value={h.value} onChange={(e) => setHeaders((all) => all.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} className="h-9 min-w-0 flex-1 font-mono text-xs" />
              <Button variant="ghost" size="icon" aria-label="Remove header" onClick={() => setHeaders((all) => all.filter((_, j) => j !== i))}>
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={() => setHeaders((all) => [...all, { key: "", value: "" }])}>
            <Plus className="h-3.5 w-3.5" aria-hidden /> Add header
          </Button>
        </fieldset>

        {method !== "GET" && method !== "DELETE" && (
          <div className="space-y-2">
            <label htmlFor="api-body" className="text-sm font-medium">
              Body (JSON)
            </label>
            <textarea
              id="api-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              spellCheck={false}
              className="w-full resize-y rounded-lg border border-border bg-code-bg p-3 font-mono text-[13px] leading-6 text-code-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            />
          </div>
        )}
      </Panel>

      {last && (
        <Panel className="animate-slide-up space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("animate-pop rounded-md border px-2.5 py-1 font-mono text-sm font-semibold", statusTone(last.res.status))}>
              {last.res.status} {last.res.statusText}
            </span>
            <span className="text-xs text-muted">{last.ms} ms (simulated)</span>
          </div>
          {Object.keys(last.res.headers).length > 0 && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg bg-background/60 p-3 font-mono text-xs">
              {Object.entries(last.res.headers).map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-subtle">{k}</dt>
                  <dd className="break-all text-foreground/90">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {last.res.body !== null && (
            <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-code-bg p-3 font-mono text-[13px] leading-6 text-code-foreground">
              {JSON.stringify(last.res.body, null, 2)}
            </pre>
          )}
        </Panel>
      )}

      {history.length > 0 && (
        <Panel>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">History</h3>
            <Button variant="ghost" size="sm" onClick={resetServer}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset mock data
            </Button>
          </div>
          <ul className="max-h-56 space-y-1 overflow-y-auto">
            {[...history].reverse().map((h, i) => (
              <li key={history.length - i} className="flex items-center gap-2 font-mono text-xs">
                <span className={cn("w-14 font-semibold", METHOD_COLOR[h.request.method])}>{h.request.method}</span>
                <span className="min-w-0 flex-1 truncate text-foreground/80">{h.request.path}</span>
                <span className={cn("rounded px-1.5 py-0.5", statusTone(h.response.status))}>{h.response.status}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </LabShell>
  );
}
