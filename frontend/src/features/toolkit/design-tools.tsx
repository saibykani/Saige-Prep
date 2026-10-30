"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/feedback";
import { Input, Label } from "@/components/ui/input";
import { boundaryValues, coversAllPairs, pairwise, parseParameters } from "./tool-utils";
import { CopyButton, DownloadButton, Editor, ToolShell } from "./tool-ui";

function NumberField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} inputMode="decimal" className="font-mono" />
    </div>
  );
}

/* ------------------------------ Boundary values ------------------------------ */

export function BvaTool() {
  const [min, setMin] = useState("18");
  const [max, setMax] = useState("65");
  const [step, setStep] = useState("1");

  const result = useMemo(() => {
    try {
      const lo = Number(min);
      const hi = Number(max);
      const st = Number(step);
      if ([lo, hi, st].some((n) => !Number.isFinite(n))) throw new Error("Enter numeric values.");
      return { ok: true as const, ...boundaryValues(lo, hi, st), lo, hi };
    } catch (e) {
      return { ok: false as const, message: e instanceof Error ? e.message : String(e) };
    }
  }, [min, max, step]);

  const rows = result.ok ? result.threeValue.map((v) => ({ v, valid: v >= result.lo && v <= result.hi, two: result.twoValue.includes(v) })) : [];
  const asText = rows.map((r) => `${r.v}\t${r.valid ? "Valid" : "Invalid"}\t${r.two ? "2-value & 3-value" : "3-value only"}`).join("\n");

  return (
    <ToolShell title="Boundary value helper" description="Enter an inclusive valid range and the input's precision (1 for integers, 0.01 for money). Get two- and three-value boundary tests with expected outcomes.">
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField id="bva-min" label="Minimum (inclusive)" value={min} onChange={setMin} />
        <NumberField id="bva-max" label="Maximum (inclusive)" value={max} onChange={setMax} />
        <NumberField id="bva-step" label="Precision / step" value={step} onChange={setStep} />
      </div>
      {!result.ok ? (
        <Alert tone="error" title="Check the inputs">
          {result.message}
        </Alert>
      ) : (
        <div className="animate-slide-up space-y-3">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge tone="accent">Two-value: {result.twoValue.join(", ")}</Badge>
            <Badge>Three-value: {result.threeValue.join(", ")}</Badge>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-raised text-left">
                <tr>
                  <th className="px-3 py-2">Test value</th>
                  <th className="px-3 py-2">Expected</th>
                  <th className="px-3 py-2">Technique</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.v} className="border-t border-border/60">
                    <td className="px-3 py-2 font-mono">{r.v}</td>
                    <td className="px-3 py-2">
                      <Badge tone={r.valid ? "success" : "danger"}>{r.valid ? "Accepted" : "Rejected"}</Badge>
                    </td>
                    <td className="px-3 py-2 text-muted">{r.two ? "Two- and three-value" : "Three-value only"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CopyButton text={asText} label="Copy as table" />
        </div>
      )}
    </ToolShell>
  );
}

/* --------------------------- Equivalence partitioning -------------------------- */

export function EquivalenceTool() {
  const [min, setMin] = useState("6");
  const [max, setMax] = useState("15");
  const [what, setWhat] = useState("Username length");

  const lo = Number(min);
  const hi = Number(max);
  const valid = Number.isFinite(lo) && Number.isFinite(hi) && lo <= hi;
  const partitions = valid
    ? [
        { name: "Invalid: below range", range: `< ${lo}`, example: lo - Math.max(1, Math.round((hi - lo) / 2)), expected: "Rejected" },
        { name: "Valid", range: `${lo} – ${hi}`, example: Math.round((lo + hi) / 2), expected: "Accepted" },
        { name: "Invalid: above range", range: `> ${hi}`, example: hi + Math.max(1, Math.round((hi - lo) / 2)), expected: "Rejected" },
        { name: "Invalid: not a number", range: "letters, symbols", example: "abc", expected: "Rejected with a clear message" },
        { name: "Invalid: empty", range: "no value", example: "(empty)", expected: "Rejected: field is required" },
      ]
    : [];

  return (
    <ToolShell title="Equivalence partitioning helper" description="Describe a numeric rule and get one representative test per partition. Pair it with the boundary value helper to cover the edges.">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="ep-what">What is being tested</Label>
          <Input id="ep-what" value={what} onChange={(e) => setWhat(e.target.value)} />
        </div>
        <NumberField id="ep-min" label="Valid minimum" value={min} onChange={setMin} />
        <NumberField id="ep-max" label="Valid maximum" value={max} onChange={setMax} />
      </div>
      {!valid ? (
        <Alert tone="error" title="Check the range">The minimum must be a number not greater than the maximum.</Alert>
      ) : (
        <div className="animate-slide-up overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <caption className="px-3 pt-3 text-left text-xs text-muted">{what}</caption>
            <thead className="bg-surface-raised text-left">
              <tr>
                <th className="px-3 py-2">Partition</th>
                <th className="px-3 py-2">Range</th>
                <th className="px-3 py-2">Representative value</th>
                <th className="px-3 py-2">Expected</th>
              </tr>
            </thead>
            <tbody>
              {partitions.map((p) => (
                <tr key={p.name} className="border-t border-border/60">
                  <td className="px-3 py-2">
                    <Badge tone={p.name === "Valid" ? "success" : "danger"}>{p.name}</Badge>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{p.range}</td>
                  <td className="px-3 py-2 font-mono">{String(p.example)}</td>
                  <td className="px-3 py-2 text-muted">{p.expected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ToolShell>
  );
}

/* ----------------------------------- Pairwise ---------------------------------- */

export function PairwiseTool() {
  const [text, setText] = useState("Browser: Chrome, Firefox, Safari, Edge\nOS: Windows, macOS, Linux\nLanguage: EN, HI\nUser type: guest, member, admin");
  const params = useMemo(() => parseParameters(text), [text]);
  const rows = useMemo(() => pairwise(params), [params]);
  const exhaustive = params.reduce((n, p) => n * p.values.length, 1);
  const covered = params.length > 1 && coversAllPairs(params, rows);
  const csv = [params.map((p) => p.name).join(","), ...rows.map((r) => r.join(","))].join("\n");

  return (
    <ToolShell title="Pairwise combination generator" description="One parameter per line as `Name: value, value, …`. The generator covers every pair of values at least once — far fewer tests than every combination, while still catching most interaction bugs.">
      <Editor id="pw-in" label="Parameters" value={text} onChange={(e) => setText(e.target.value)} className="min-h-32" />
      {params.length < 2 ? (
        <Alert title="Add at least two parameters">Example: Browser: Chrome, Firefox</Alert>
      ) : (
        <div className="animate-slide-up space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{rows.length} pairwise tests</Badge>
            <Badge>{exhaustive} exhaustive combinations</Badge>
            <Badge tone="success">{Math.round((1 - rows.length / exhaustive) * 100)}% fewer tests</Badge>
            {covered && <Badge tone="success">✓ every pair verified covered</Badge>}
            <DownloadButton text={csv} filename="pairwise-tests.csv" mime="text/csv" />
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-raised text-left">
                <tr>
                  <th className="px-3 py-2">#</th>
                  {params.map((p) => (
                    <th key={p.name} className="px-3 py-2">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-border/60">
                    <td className="px-3 py-2 font-mono text-xs text-subtle">{i + 1}</td>
                    {r.map((v, j) => (
                      <td key={j} className="px-3 py-2">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted">Generated with a deterministic greedy algorithm; the result is checked for full pair coverage. Optimised tools may find slightly smaller sets.</p>
        </div>
      )}
    </ToolShell>
  );
}
