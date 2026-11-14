import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildCrumbs } from "@/components/navigation/breadcrumbs";
import { allDomains, TRACKS } from "@/content/curriculum";
import { activeChain, activeNavItem, findNavItem, NAV_AREAS, NAV_GROUPS, NAV_ITEMS, searchNav } from "./navigation";

const appDir = path.join(process.cwd(), "src", "app", "(app)");

/** True when a static page.tsx, or a dynamic one covering the href, exists under the (app) group. */
function routeExists(href: string) {
  const segments = href.split("/").filter(Boolean);
  let dirs = [appDir];
  for (const seg of segments) {
    dirs = dirs.flatMap((dir) => {
      const out: string[] = [];
      if (existsSync(path.join(dir, seg))) out.push(path.join(dir, seg));
      for (const dyn of ["[domain]", "[course]", "[track]", "[role]", "[lesson]", "[bank]", "[lab]", "[slug]", "[tool]"]) {
        if (existsSync(path.join(dir, dyn))) out.push(path.join(dir, dyn));
      }
      return out;
    });
  }
  return dirs.some((d) => existsSync(path.join(d, "page.tsx")));
}

describe("navigation model", () => {
  it("has the four areas in order", () => {
    expect(NAV_AREAS.map((a) => a.href)).toEqual(["/careers", "/exams", "/aptitude", "/careers/non-it"]);
    expect(NAV_AREAS.map((a) => a.label)).toEqual(["Careers (IT)", "Government Exams", "Aptitude", "India Careers (Non-IT)"]);
  });

  it("generates the Careers children from content/domains, then the cross-area index pages", () => {
    const careers = NAV_AREAS[0];
    const itDomains = allDomains().filter((d) => d.kind === "it");
    expect(careers.children?.slice(0, itDomains.length).map((c) => c.href)).toEqual(itDomains.map((d) => `/careers/${d.slug}`));
    expect(careers.children?.slice(itDomains.length).map((c) => c.href)).toEqual(["/learn", "/roadmaps"]);
  });

  it("shows areas, not courses, in the sidebar", () => {
    const sidebar = NAV_GROUPS.flatMap((g) => g.items.flatMap((i) => [i, ...(i.children ?? [])]));
    const sidebarHrefs = new Set(sidebar.map((i) => i.href));
    for (const t of TRACKS) expect(sidebarHrefs.has(t.href), t.href).toBe(false);
    for (const t of TRACKS) expect(findNavItem(t.href)?.hidden, t.href).toBe(true);
  });

  it("places the cross-cutting tools", () => {
    const labels = NAV_ITEMS.map((item) => item.label);
    for (const required of [
      "Dashboard", "Practice Lab", "Mock Tests", "Interview Prep", "QA Toolkit", "Study Planner",
      "Progress & Analytics", "Bookmarks", "Notes", "Help & User Guide", "Settings",
    ]) {
      expect(labels).toContain(required);
    }
  });

  it("has unique hrefs and every href resolves to a route", () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const href of hrefs) expect(routeExists(href), href).toBe(true);
  });

  it("every parent exists and planned areas carry an honest description of what is planned", () => {
    for (const item of NAV_ITEMS) if (item.parent) expect(findNavItem(item.parent), item.href).toBeDefined();
    for (const area of NAV_AREAS.filter((a) => a.status === "planned")) {
      expect(area.planned?.length, area.href).toBeGreaterThan(0);
      expect(area.schedule, area.href).toBeTruthy();
    }
    expect(NAV_AREAS.filter((a) => a.status === "planned").map((a) => a.href)).toEqual(["/exams", "/aptitude", "/careers/non-it"]);
  });

  it("picks the most specific active item and its ancestor chain", () => {
    expect(activeNavItem("/careers/testing/manual-testing/some-lesson")?.href).toBe("/careers/testing/manual-testing");
    expect(activeNavItem("/learn")?.href).toBe("/learn");
    expect(activeNavItem("/learning")).toBeUndefined();
    expect(activeNavItem("/careers/non-it")?.href).toBe("/careers/non-it");
    expect([...activeChain("/careers/testing/manual-testing/x")]).toEqual([
      "/careers/testing/manual-testing", "/careers/testing", "/careers",
    ]);
    // Non-IT is its own area, not part of the Careers (IT) branch.
    expect(activeChain("/careers/non-it").has("/careers")).toBe(false);
    expect([...activeChain("/careers/testing/roles/sdet")]).toEqual(["/careers/testing", "/careers"]);
  });

  it("searches labels, descriptions and keywords, hiding admin items from learners", () => {
    expect(searchNav("jmeter", false).map((i) => i.href)).toEqual(["/careers/testing/performance", "/careers/testing/jmeter"]);
    expect(searchNav("upsc", false).map((i) => i.href)).toContain("/exams");
    expect(searchNav("admin", false)).toHaveLength(0);
    expect(searchNav("admin", true).map((i) => i.href)).toContain("/admin");
  });
});

describe("buildCrumbs", () => {
  it("keeps acronyms in capitals for unknown segments", () => {
    expect(buildCrumbs("/careers/testing/zzz/some-api-thing").at(-1)?.label).toBe("Some API Thing");
  });

  it("uses real labels: domain, course and lesson titles", () => {
    const crumbs = buildCrumbs("/careers/testing/manual-testing/boundary-value-analysis");
    expect(crumbs.map((c) => c.href)).toEqual([
      "/careers", "/careers/testing", "/careers/testing/manual-testing", "/careers/testing/manual-testing/boundary-value-analysis",
    ]);
    expect(crumbs.map((c) => c.label).slice(0, 3)).toEqual(["Careers (IT)", "Testing & QA", "Manual Testing"]);
    expect(crumbs.at(-1)?.label).toBe("Boundary value analysis");
    expect(buildCrumbs("/careers/non-it").at(-1)?.label).toBe("India Careers (Non-IT)");
  });

  it("labels roles by catalogue title and links scoped index crumbs straight to the index (no redirect hop)", () => {
    const crumbs = buildCrumbs("/careers/testing/roles/sdet");
    expect(crumbs[2]).toEqual({ href: "/roadmaps", label: "Roles" });
    expect(crumbs[3].label).toContain("SDET");
    expect(buildCrumbs("/careers/testing/mock-tests/x")[2]).toEqual({ href: "/mock-tests", label: "Mock Tests" });
    expect(buildCrumbs("/careers/testing/interviews/x")[2]).toEqual({ href: "/interviews", label: "Interview Prep" });
  });
});
