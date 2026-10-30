import { describe, expect, it } from "vitest";
import {
  base64Decode,
  base64Encode,
  boundaryValues,
  coversAllPairs,
  decodeJwt,
  formatXml,
  jsonDiff,
  pairwise,
  parseJsonWithPosition,
  parseParameters,
} from "./tool-utils";

describe("jsonDiff", () => {
  it("reports added, removed, changed and type differences with paths", () => {
    const diff = jsonDiff({ id: 1, name: "A", tags: ["x"], meta: { v: 1 } }, { id: "1", name: "B", tags: ["x", "y"], extra: true });
    expect(diff).toEqual([
      { path: "$.extra", kind: "added", right: true },
      { path: "$.id", kind: "type", left: 1, right: "1" },
      { path: "$.meta", kind: "removed", left: { v: 1 } },
      { path: "$.name", kind: "changed", left: "A", right: "B" },
      { path: "$.tags[1]", kind: "added", right: "y" },
    ]);
    expect(jsonDiff({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toEqual([]);
  });

  it("locates JSON syntax errors", () => {
    const r = parseJsonWithPosition('{\n  "a": 1,\n  "b": }');
    expect(r.ok).toBe(false);
  });
});

describe("base64 and JWT", () => {
  it("round-trips UTF-8 and supports Base64URL", () => {
    expect(base64Decode(base64Encode("Saige ✓ नमस्ते"))).toBe("Saige ✓ नमस्ते");
    expect(base64Encode("??>", true)).not.toMatch(/[+/=]/);
    expect(() => base64Decode("not*base64")).toThrow();
  });

  it("decodes a JWT header and payload", () => {
    const token = `${base64Encode('{"alg":"HS256","typ":"JWT"}', true)}.${base64Encode('{"sub":"42","role":"tester"}', true)}.sig`;
    expect(decodeJwt(token)).toEqual({ header: { alg: "HS256", typ: "JWT" }, payload: { sub: "42", role: "tester" } });
    expect(() => decodeJwt("a.b")).toThrow();
  });
});

describe("boundaryValues", () => {
  it("handles integers and decimals", () => {
    expect(boundaryValues(18, 65, 1)).toMatchObject({ twoValue: [17, 18, 65, 66], threeValue: [17, 18, 19, 64, 65, 66] });
    expect(boundaryValues(100, 499.99, 0.01).twoValue).toEqual([99.99, 100, 499.99, 500]);
    expect(() => boundaryValues(5, 1, 1)).toThrow();
  });
});

describe("pairwise", () => {
  it("covers every pair with fewer rows than exhaustive testing", () => {
    const params = parseParameters("Browser: Chrome, Firefox, Safari\nOS: Windows, macOS\nLanguage: EN, HI\nUser: guest, member");
    const rows = pairwise(params);
    expect(coversAllPairs(params, rows)).toBe(true);
    expect(rows.length).toBeGreaterThanOrEqual(6);
    expect(rows.length).toBeLessThan(3 * 2 * 2 * 2);
  });

  it("covers larger inputs", () => {
    const params = Array.from({ length: 6 }, (_, i) => ({ name: `P${i}`, values: ["a", "b", "c"] }));
    const rows = pairwise(params);
    expect(coversAllPairs(params, rows)).toBe(true);
    expect(rows.length).toBeLessThan(729);
  });
});

describe("formatXml", () => {
  it("indents nested elements", () => {
    expect(formatXml("<a><b>1</b><c/></a>")).toBe("<a>\n  <b>1</b>\n  <c/>\n</a>");
  });
});
