"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { base64Decode, base64Encode, decodeJwt, formatXml, jsonDiff, parseJsonWithPosition } from "./tool-utils";
import { DownloadButton, Editor, Output, Segmented, ToolShell } from "./tool-ui";

/* ------------------------------------ JSON ------------------------------------ */

const SAMPLE_JSON = '{"id":42,"name":"Asha","roles":["tester","reviewer"],"active":true}';

export function JsonTool() {
  const [mode, setMode] = useState<"format" | "diff">("format");
  const [input, setInput] = useState(SAMPLE_JSON);
  const [right, setRight] = useState('{"id":"42","name":"Asha R","roles":["tester"],"active":true,"team":"QA"}');
  const [indent, setIndent] = useState(2);

  const parsed = useMemo(() => parseJsonWithPosition(input), [input]);
  const parsedRight = useMemo(() => parseJsonWithPosition(right), [right]);
  const diff = useMemo(() => (parsed.ok && parsedRight.ok ? jsonDiff(parsed.value, parsedRight.value) : null), [parsed, parsedRight]);

  return (
    <ToolShell title="JSON formatter, validator & diff" description="Pretty-print or minify JSON, see exactly where it is invalid, or compare two documents — e.g. an expected vs actual API response.">
      <Segmented
        label="Mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: "format", label: "Format & validate" },
          { value: "diff", label: "Compare two JSON" },
        ]}
      />
      {mode === "format" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Editor id="json-in" label="Input" value={input} onChange={(e) => setInput(e.target.value)} className="min-h-72" />
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {parsed.ok ? <Badge tone="success">✓ Valid JSON</Badge> : <Badge tone="danger">Invalid JSON</Badge>}
              <Segmented
                label="Indentation"
                value={String(indent)}
                onChange={(v) => setIndent(Number(v))}
                options={[
                  { value: "2", label: "2 spaces" },
                  { value: "4", label: "4 spaces" },
                  { value: "0", label: "Minify" },
                ]}
              />
            </div>
            {parsed.ok ? (
              <Output label="Output" value={JSON.stringify(parsed.value, null, indent || undefined)} tone="success" />
            ) : (
              <Alert tone="error" title={parsed.line ? `Error at line ${parsed.line}, column ${parsed.column}` : "Parse error"}>
                <span className="font-mono text-xs">{parsed.message}</span>
              </Alert>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Editor id="json-left" label="Expected (left)" value={input} onChange={(e) => setInput(e.target.value)} />
            <Editor id="json-right" label="Actual (right)" value={right} onChange={(e) => setRight(e.target.value)} />
          </div>
          {!parsed.ok || !parsedRight.ok ? (
            <Alert tone="error" title="Both sides must be valid JSON">
              {!parsed.ok ? `Left: ${parsed.message}` : `Right: ${!parsedRight.ok && parsedRight.message}`}
            </Alert>
          ) : diff && diff.length === 0 ? (
            <Alert tone="success" title="Identical">The two documents are deeply equal.</Alert>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-raised text-left">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Path</th>
                    <th className="px-3 py-2 font-semibold">Change</th>
                    <th className="px-3 py-2 font-semibold">Expected</th>
                    <th className="px-3 py-2 font-semibold">Actual</th>
                  </tr>
                </thead>
                <tbody>
                  {diff?.map((d) => (
                    <tr key={d.path} className="border-t border-border/60">
                      <td className="px-3 py-2 font-mono text-xs">{d.path}</td>
                      <td className="px-3 py-2">
                        <Badge tone={d.kind === "added" ? "success" : d.kind === "removed" ? "danger" : "warning"}>{d.kind === "type" ? "type changed" : d.kind}</Badge>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-muted">{d.left === undefined ? "—" : JSON.stringify(d.left)}</td>
                      <td className="px-3 py-2 font-mono text-xs">{d.right === undefined ? "—" : JSON.stringify(d.right)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </ToolShell>
  );
}

/* ------------------------------------ XML ------------------------------------- */

export function XmlTool() {
  const [input, setInput] = useState('<order id="101"><item sku="KB-100" qty="1"/><total currency="INR">79.00</total></order>');
  const result = useMemo(() => {
    if (!input.trim()) return { ok: false as const, message: "Paste some XML." };
    const doc = new DOMParser().parseFromString(input, "application/xml");
    const err = doc.querySelector("parsererror");
    if (err) return { ok: false as const, message: err.textContent?.replace(/\s+/g, " ").trim() ?? "Invalid XML" };
    return { ok: true as const, formatted: formatXml(new XMLSerializer().serializeToString(doc)) };
  }, [input]);
  return (
    <ToolShell title="XML formatter & validator" description="Check that XML is well-formed and pretty-print it — handy for SOAP responses and JMeter .jmx files. (Well-formedness only; no XSD schema validation.)">
      <div className="grid gap-4 lg:grid-cols-2">
        <Editor id="xml-in" label="Input" value={input} onChange={(e) => setInput(e.target.value)} className="min-h-72" />
        {result.ok ? (
          <Output label="Formatted (well-formed ✓)" value={result.formatted} tone="success" />
        ) : (
          <Alert tone="error" title="Not well-formed">
            <span className="font-mono text-xs">{result.message}</span>
          </Alert>
        )}
      </div>
    </ToolShell>
  );
}

/* ----------------------------------- Base64 ----------------------------------- */

export function Base64Tool() {
  const [mode, setMode] = useState<"encode" | "decode" | "jwt">("encode");
  const [input, setInput] = useState("tester:Test@123");
  const [urlSafe, setUrlSafe] = useState(false);

  const output = useMemo(() => {
    try {
      if (mode === "encode") return { ok: true, value: base64Encode(input, urlSafe) };
      if (mode === "decode") return { ok: true, value: base64Decode(input) };
      const { header, payload } = decodeJwt(input);
      return { ok: true, value: `// Header\n${JSON.stringify(header, null, 2)}\n\n// Payload\n${JSON.stringify(payload, null, 2)}` };
    } catch (e) {
      return { ok: false, value: e instanceof Error ? e.message : String(e) };
    }
  }, [input, mode, urlSafe]);

  return (
    <ToolShell title="Base64 encode / decode & JWT inspector" description="Encode or decode Base64 (UTF-8 safe), or peek inside a JWT's header and payload. Remember: Base64 is encoding, not encryption.">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "encode", label: "Encode" },
            { value: "decode", label: "Decode" },
            { value: "jwt", label: "Decode JWT" },
          ]}
        />
        {mode === "encode" && (
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} className="accent-accent" />
            URL-safe (Base64URL)
          </label>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Editor id="b64-in" label="Input" value={input} onChange={(e) => setInput(e.target.value)} />
        <Output label="Output" value={output.value} tone={output.ok ? "success" : "error"} />
      </div>
      {mode === "jwt" && (
        <Alert title="The signature is not verified">
          Decoding shows what a token claims; it does not prove the token is genuine. Never paste production tokens into tools you don&apos;t control.
        </Alert>
      )}
    </ToolShell>
  );
}

/* ------------------------------------ Regex ----------------------------------- */

export function RegexTool() {
  const [pattern, setPattern] = useState("ORD-(\\d{4})-([A-Z]{2})");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("Orders: ORD-2026-IN shipped, ORD-2025-UK cancelled, ORD-26-XX invalid.");

  const result = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags.includes("g") ? flags : `${flags}g`);
      const matches = [...text.matchAll(re)].slice(0, 200);
      return { ok: true as const, matches };
    } catch (e) {
      return { ok: false as const, message: e instanceof Error ? e.message : String(e) };
    }
  }, [pattern, flags, text]);

  const highlighted = useMemo(() => {
    if (!result.ok || result.matches.length === 0) return [{ text, match: false }];
    const parts: { text: string; match: boolean }[] = [];
    let last = 0;
    for (const m of result.matches) {
      const start = m.index ?? 0;
      if (m[0].length === 0) continue;
      parts.push({ text: text.slice(last, start), match: false }, { text: m[0], match: true });
      last = start + m[0].length;
    }
    parts.push({ text: text.slice(last), match: false });
    return parts;
  }, [result, text]);

  return (
    <ToolShell title="Regex tester" description="Try JavaScript regular expressions with live highlighting and capture groups — the same skill you'll use in JMeter Regular Expression Extractors and log analysis.">
      <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
        <div className="space-y-1.5">
          <Label htmlFor="re-pattern">Pattern</Label>
          <Input id="re-pattern" value={pattern} onChange={(e) => setPattern(e.target.value)} className="font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="re-flags">Flags</Label>
          <Input id="re-flags" value={flags} onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ""))} className="font-mono" />
        </div>
      </div>
      <Editor id="re-text" label="Test text" value={text} onChange={(e) => setText(e.target.value)} />
      {!result.ok ? (
        <Alert tone="error" title="Invalid pattern">
          {result.message}
        </Alert>
      ) : (
        <div className="space-y-3">
          <p className="rounded-xl border border-border bg-code-bg p-3 font-mono text-[13px] leading-7">
            {highlighted.map((p, i) => (
              <span key={i} className={cn(p.match && "rounded bg-accent/30 px-0.5 text-foreground ring-1 ring-accent/60")}>
                {p.text}
              </span>
            ))}
          </p>
          <p className="text-sm text-muted">{result.matches.length} match{result.matches.length === 1 ? "" : "es"}</p>
          {result.matches.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-raised text-left">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Match</th>
                    {result.matches[0].slice(1).map((_, g) => (
                      <th key={g} className="px-3 py-2">
                        Group {g + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.matches.map((m, i) => (
                    <tr key={i} className="border-t border-border/60 font-mono text-xs">
                      <td className="px-3 py-2 text-subtle">{i + 1}</td>
                      <td className="px-3 py-2">{m[0]}</td>
                      {m.slice(1).map((g, j) => (
                        <td key={j} className="px-3 py-2 text-accent">
                          {g ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </ToolShell>
  );
}

/* ---------------------------------- Timestamp --------------------------------- */

export function TimestampTool() {
  const [input, setInput] = useState("");
  const parsed = useMemo(() => {
    const v = input.trim();
    if (!v) return null;
    let date: Date;
    if (/^-?\d+$/.test(v)) {
      const n = Number(v);
      date = new Date(Math.abs(n) < 1e11 ? n * 1000 : n); // ≤ 11 digits → seconds, else milliseconds
    } else {
      date = new Date(v);
    }
    return Number.isNaN(date.getTime()) ? "invalid" : date;
  }, [input]);

  const rows =
    parsed instanceof Date
      ? [
          ["ISO 8601 (UTC)", parsed.toISOString()],
          ["Unix seconds", String(Math.floor(parsed.getTime() / 1000))],
          ["Unix milliseconds", String(parsed.getTime())],
          ["Your local time", parsed.toLocaleString(undefined, { dateStyle: "full", timeStyle: "long" })],
          ["UTC", parsed.toUTCString()],
          ["India (Asia/Kolkata)", parsed.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "long" })],
          ["New York (America/New_York)", parsed.toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "long" })],
          ["London (Europe/London)", parsed.toLocaleString("en-GB", { timeZone: "Europe/London", dateStyle: "medium", timeStyle: "long" })],
        ]
      : [];

  return (
    <ToolShell title="Timestamp converter" description="Convert Unix epoch seconds or milliseconds and ISO-8601 dates across time zones — essential when log times and API times disagree.">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="ts-in">Epoch (s or ms) or a date string</Label>
          <Input id="ts-in" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. 1767225600 or 2026-03-31T23:59:00Z" className="h-11 font-mono" />
        </div>
        <Button variant="secondary" onClick={() => setInput(String(Date.now()))}>
          Now
        </Button>
      </div>
      {parsed === "invalid" && <Alert tone="error" title="Could not read that date">Try an epoch number or an ISO date like 2026-03-31T23:59:00Z.</Alert>}
      {rows.length > 0 && (
        <dl className="animate-slide-up divide-y divide-border rounded-xl border border-border bg-surface">
          {rows.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center">
              <dt className="w-56 shrink-0 text-sm text-muted">{k}</dt>
              <dd className="font-mono text-sm">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </ToolShell>
  );
}

/* --------------------------------- Test data ---------------------------------- */

const FIRST = ["Asha", "Ben", "Chen", "Diana", "Elif", "Farah", "Gopal", "Hana", "Ivan", "Jaya", "Kofi", "Lena", "Mateo", "Nisha", "Omar", "Priya"];
const LAST = ["Rao", "Carter", "Wei", "Lopez", "Kaya", "Khan", "Iyer", "Sato", "Petrov", "Menon", "Mensah", "Fischer", "Silva", "Gupta", "Haddad", "Nair"];
const EDGE_STRINGS = ["", " ", "a", "O'Brien", "Zoë Åström", "名前", "مرحبا", "😀 emoji", "<script>alert(1)</script>", "Robert'); DROP TABLE students;--", "x".repeat(256)];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function makeRow(i: number, fields: string[]) {
  const first = pick(FIRST);
  const last = pick(LAST);
  const row: Record<string, string | number> = {};
  for (const f of fields) {
    if (f === "id") row.id = i + 1;
    if (f === "uuid") row.uuid = crypto.randomUUID();
    if (f === "name") row.name = `${first} ${last}`;
    // example.com / .test are reserved for documentation and testing (RFC 2606), so these never reach real people.
    if (f === "email") row.email = `${first}.${last}${i + 1}@example.com`.toLowerCase();
    if (f === "phone") row.phone = `+91 9${String(Math.floor(Math.random() * 1e9)).padStart(9, "0")}`;
    if (f === "date") row.date = new Date(Date.UTC(2026, Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28))).toISOString().slice(0, 10);
    if (f === "amount") row.amount = Number((Math.random() * 5000).toFixed(2));
    if (f === "edgeString") row.edgeString = EDGE_STRINGS[i % EDGE_STRINGS.length];
  }
  return row;
}

const FIELDS = ["id", "uuid", "name", "email", "phone", "date", "amount", "edgeString"];

export function TestDataTool() {
  const [count, setCount] = useState(10);
  const [fields, setFields] = useState(["id", "name", "email", "amount"]);
  const [format, setFormat] = useState<"json" | "csv">("csv");
  const [rows, setRows] = useState<Record<string, string | number>[]>([]);

  const output = useMemo(() => {
    if (!rows.length) return "";
    if (format === "json") return JSON.stringify(rows, null, 2);
    const esc = (v: string | number) => {
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [fields.join(","), ...rows.map((r) => fields.map((f) => esc(r[f] ?? "")).join(","))].join("\n");
  }, [rows, format, fields]);

  return (
    <ToolShell title="Test data generator" description="Generate synthetic records for testing — never use real customer data. Emails use example.com (reserved for testing) and edge strings include Unicode, quotes and injection-style payloads for negative tests.">
      <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Fields">
          {FIELDS.map((f) => {
            const on = fields.includes(f);
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => setFields((all) => (on ? all.filter((x) => x !== f) : FIELDS.filter((x) => all.includes(x) || x === f)))}
                className={cn("rounded-full border px-3 py-1 font-mono text-xs transition-colors", on ? "border-accent bg-accent-soft" : "border-border text-muted")}
              >
                {f}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="td-count">Rows (1–1000)</Label>
            <Input id="td-count" type="number" min={1} max={1000} value={count} onChange={(e) => setCount(Math.min(1000, Math.max(1, Number(e.target.value) || 1)))} className="w-28" />
          </div>
          <Segmented
            label="Format"
            value={format}
            onChange={setFormat}
            options={[
              { value: "csv", label: "CSV" },
              { value: "json", label: "JSON" },
            ]}
          />
          <Button onClick={() => setRows(Array.from({ length: count }, (_, i) => makeRow(i, fields)))} disabled={!fields.length}>
            Generate
          </Button>
          <DownloadButton text={output} filename={`test-data.${format}`} mime={format === "json" ? "application/json" : "text/csv"} />
        </div>
      </div>
      {output && <Output label={`${rows.length} rows`} value={output} />}
    </ToolShell>
  );
}
