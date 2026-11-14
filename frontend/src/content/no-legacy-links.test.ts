// Internal links must use the canonical /careers URLs (docs/expansion-plan.md, step 4), so
// following a link never costs a redirect hop. Legacy detail URLs live only in the redirect
// generator and the frozen fixture.
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const LEGACY_DETAIL = /["'`](\/(?:learn|roadmaps|mock-tests|interviews)\/[^"'`\s]+)/g;
const ALLOWED = new Set(["content.test.ts", "legacy-redirects.ts", "legacy-urls.test.ts", "no-legacy-links.test.ts"]);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe("internal links", () => {
  it("do not point at legacy detail URLs", () => {
    const root = path.join(process.cwd(), "src");
    const hits: string[] = [];
    for (const file of walk(root)) {
      if (!/\.(ts|tsx)$/.test(file) || ALLOWED.has(path.basename(file))) continue;
      for (const m of readFileSync(file, "utf8").matchAll(LEGACY_DETAIL)) {
        hits.push(`${path.relative(root, file)}: ${m[1]}`);
      }
    }
    expect(hits).toEqual([]);
  });
});
