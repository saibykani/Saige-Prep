// Guards every URL that existed before the expansion (docs/expansion-plan.md, step 1).
// A frozen URL must keep resolving: either as a page (static route, or a dynamic route whose
// generateStaticParams yields it) or through a permanent redirect from next.config.ts that
// itself ends on a resolving URL. Never delete entries from legacy-urls.json to make this pass.
import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";
import nextConfig from "../../next.config";
import fixture from "./legacy-urls.json";

vi.mock("server-only", () => ({}));

type MatchFn = (path: string) => false | { params: Record<string, string | string[]> };
const require_ = createRequire(import.meta.url);
const { match, compile } = require_("next/dist/compiled/path-to-regexp") as {
  match: (p: string) => MatchFn;
  compile: (p: string) => (params: Record<string, unknown>) => string;
};

type StaticParams = () => Record<string, string>[] | Promise<Record<string, string>[]>;
const pageModules = import.meta.glob<{ generateStaticParams?: StaticParams }>("../app/**/page.tsx");

// "../app/(app)/learn/[track]/page.tsx" -> "/learn/[track]"
const routeOf = (file: string) =>
  "/" +
  file
    .replace("../app/", "")
    .replace(/\/?page\.tsx$/, "")
    .split("/")
    .filter((seg) => seg && !/^\(.*\)$/.test(seg))
    .join("/");

async function buildPageSet() {
  const pages = new Set<string>();
  for (const [file, load] of Object.entries(pageModules)) {
    const route = routeOf(file);
    if (!route.includes("[")) {
      pages.add(route);
      continue;
    }
    const mod = await load();
    if (!mod.generateStaticParams) continue;
    for (const params of await mod.generateStaticParams()) {
      pages.add(route.replace(/\[(\w+)\]/g, (_, key: string) => params[key]));
    }
  }
  return pages;
}

type Redirect = { source: string; destination: string; permanent: boolean };

describe("frozen legacy URLs", () => {
  const urls = fixture.urls as string[];

  it("is a sorted, unique list with a matching count", () => {
    expect(fixture.count).toBe(urls.length);
    expect(new Set(urls).size).toBe(urls.length);
    expect([...urls].sort()).toEqual(urls);
    expect(urls.length).toBeGreaterThan(390);
    for (const u of urls) expect(u).toMatch(/^\/[a-z0-9\-/]*$/);
  });

  it("keeps every URL resolving as a page or a permanent redirect", async () => {
    const pages = await buildPageSet();
    const redirects = ((await nextConfig.redirects?.()) ?? []) as Redirect[];
    const matchers = redirects.map((r) => ({ r, m: match(r.source), to: compile(r.destination) }));

    const resolves = (url: string, depth = 0): boolean => {
      if (pages.has(url)) return true;
      if (depth > 5) return false;
      for (const { r, m, to } of matchers) {
        const hit = m(url);
        if (hit && r.permanent) return resolves(to(hit.params), depth + 1);
      }
      return false;
    };

    const broken = urls.filter((u) => !resolves(u));
    expect(broken, `Frozen URLs that no longer resolve:\n${broken.join("\n")}`).toEqual([]);
  }, 60_000);
});
