/** Pure helpers behind the QA Toolkit (unit-tested in tool-utils.test.ts). */

/* --------------------------------- JSON diff --------------------------------- */

export interface JsonDifference {
  path: string;
  kind: "added" | "removed" | "changed" | "type";
  left?: unknown;
  right?: unknown;
}

const typeOf = (v: unknown) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);

export function jsonDiff(left: unknown, right: unknown, path = "$"): JsonDifference[] {
  const lt = typeOf(left);
  const rt = typeOf(right);
  if (lt !== rt) return [{ path, kind: "type", left, right }];
  if (lt === "array") {
    const a = left as unknown[];
    const b = right as unknown[];
    const out: JsonDifference[] = [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (i >= a.length) out.push({ path: `${path}[${i}]`, kind: "added", right: b[i] });
      else if (i >= b.length) out.push({ path: `${path}[${i}]`, kind: "removed", left: a[i] });
      else out.push(...jsonDiff(a[i], b[i], `${path}[${i}]`));
    }
    return out;
  }
  if (lt === "object") {
    const a = left as Record<string, unknown>;
    const b = right as Record<string, unknown>;
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    return keys.flatMap((k) => {
      const p = /^[A-Za-z_$][\w$]*$/.test(k) ? `${path}.${k}` : `${path}[${JSON.stringify(k)}]`;
      if (!(k in b)) return [{ path: p, kind: "removed" as const, left: a[k] }];
      if (!(k in a)) return [{ path: p, kind: "added" as const, right: b[k] }];
      return jsonDiff(a[k], b[k], p);
    });
  }
  return Object.is(left, right) ? [] : [{ path, kind: "changed", left, right }];
}

/** Parse JSON and report a 1-based line/column on error. */
export function parseJsonWithPosition(text: string): { ok: true; value: unknown } | { ok: false; message: string; line?: number; column?: number } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const pos = /position (\d+)/i.exec(message);
    if (pos) {
      const index = Number(pos[1]);
      const before = text.slice(0, index);
      const line = before.split("\n").length;
      const column = index - before.lastIndexOf("\n");
      return { ok: false, message, line, column };
    }
    const lc = /line (\d+) column (\d+)/i.exec(message);
    return lc ? { ok: false, message, line: Number(lc[1]), column: Number(lc[2]) } : { ok: false, message };
  }
}

/* ---------------------------------- Base64 ---------------------------------- */

export function base64Encode(text: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const b64 = btoa(binary);
  return urlSafe ? b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : b64;
}

export function base64Decode(input: string): string {
  let b64 = input.trim().replace(/-/g, "+").replace(/_/g, "/").replace(/\s+/g, "");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64)) throw new Error("Input contains characters that are not valid Base64.");
  while (b64.length % 4) b64 += "=";
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

/** Decode a JWT's header and payload. Does NOT verify the signature. */
export function decodeJwt(token: string): { header: unknown; payload: unknown } {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("A JWT has three dot-separated parts: header.payload.signature");
  return { header: JSON.parse(base64Decode(parts[0])), payload: JSON.parse(base64Decode(parts[1])) };
}

/* ------------------------------ Boundary values ------------------------------ */

export function boundaryValues(min: number, max: number, step: number) {
  if (!(step > 0)) throw new Error("Step must be greater than 0");
  if (min > max) throw new Error("Minimum must not be greater than maximum");
  const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  const r = (v: number) => Number(v.toFixed(Math.min(decimals + 2, 10)));
  const twoValue = [r(min - step), r(min), r(max), r(max + step)];
  const threeValue = [...new Set([r(min - step), r(min), r(min + step), r(max - step), r(max), r(max + step)])].sort((a, b) => a - b);
  return { twoValue, threeValue, decimals };
}

/* ---------------------------------- Pairwise --------------------------------- */

export interface Parameter {
  name: string;
  values: string[];
}

/** Greedy all-pairs generation (deterministic). Every pair of values across every two parameters is covered. */
export function pairwise(params: Parameter[]): string[][] {
  const p = params.filter((x) => x.values.length > 0);
  if (p.length === 0) return [];
  if (p.length === 1) return p[0].values.map((v) => [v]);

  const key = (i: number, a: number, j: number, b: number) => `${i}:${a}|${j}:${b}`;
  const uncovered = new Set<string>();
  for (let i = 0; i < p.length; i++)
    for (let j = i + 1; j < p.length; j++)
      for (let a = 0; a < p[i].values.length; a++) for (let b = 0; b < p[j].values.length; b++) uncovered.add(key(i, a, j, b));

  const rows: number[][] = [];
  while (uncovered.size > 0) {
    // Seed the row with the first uncovered pair, then fill the remaining parameters greedily.
    const [first] = uncovered;
    const [[i, a], [j, b]] = first.split("|").map((s) => s.split(":").map(Number));
    const row: number[] = new Array(p.length).fill(-1);
    row[i] = a;
    row[j] = b;
    for (let k = 0; k < p.length; k++) {
      if (row[k] !== -1) continue;
      let best = 0;
      let bestGain = -1;
      for (let v = 0; v < p[k].values.length; v++) {
        let gain = 0;
        for (let m = 0; m < p.length; m++) {
          if (m === k || row[m] === -1) continue;
          const pairKey = m < k ? key(m, row[m], k, v) : key(k, v, m, row[m]);
          if (uncovered.has(pairKey)) gain++;
        }
        if (gain > bestGain) {
          bestGain = gain;
          best = v;
        }
      }
      row[k] = best;
    }
    for (let x = 0; x < p.length; x++) for (let y = x + 1; y < p.length; y++) uncovered.delete(key(x, row[x], y, row[y]));
    rows.push(row);
  }
  return rows.map((row) => row.map((v, k) => p[k].values[v]));
}

/** Verifies every value pair is covered by at least one row. */
export function coversAllPairs(params: Parameter[], rows: string[][]): boolean {
  for (let i = 0; i < params.length; i++)
    for (let j = i + 1; j < params.length; j++)
      for (const a of params[i].values) for (const b of params[j].values) if (!rows.some((r) => r[i] === a && r[j] === b)) return false;
  return true;
}

export function parseParameters(text: string): Parameter[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, rest = ""] = line.includes(":") ? [line.slice(0, line.indexOf(":")), line.slice(line.indexOf(":") + 1)] : [line, ""];
      return { name: name.trim(), values: [...new Set(rest.split(",").map((v) => v.trim()).filter(Boolean))] };
    })
    .filter((param) => param.name && param.values.length);
}

/* --------------------------------- Formatting -------------------------------- */

export function formatXml(xml: string, indent = "  "): string {
  const tokens = xml.replace(/>\s+</g, "><").replace(/(>)(<)(\/*)/g, "$1\n$2$3").split("\n");
  let depth = 0;
  return tokens
    .map((token) => {
      const t = token.trim();
      if (!t) return "";
      if (t.startsWith("</")) depth = Math.max(depth - 1, 0);
      const line = indent.repeat(depth) + t;
      // A line that is only an opening tag (not self-closing, not <?…?> or <!…>) opens a level.
      if (/^<[A-Za-z_][^>]*>$/.test(t) && !t.endsWith("/>")) depth++;
      return line;
    })
    .filter(Boolean)
    .join("\n");
}
