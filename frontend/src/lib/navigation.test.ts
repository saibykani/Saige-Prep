import { describe, expect, it } from "vitest";
import { buildCrumbs } from "@/components/navigation/breadcrumbs";
import { activeNavItem, NAV_ITEMS, searchNav } from "./navigation";

describe("navigation registry", () => {
  it("contains every required main-navigation section", () => {
    const labels = NAV_ITEMS.map((item) => item.label);
    for (const required of [
      "Dashboard",
      "Learning Center",
      "Role Roadmaps",
      "Manual Testing",
      "Automation Testing",
      "API Testing",
      "Performance Testing",
      "Mobile Testing",
      "Specialist Testing",
      "SDET Engineering",
      "Practice Lab",
      "Mock Tests",
      "Interview Prep",
      "Real-World Projects",
      "QA Toolkit",
      "Study Planner",
      "Progress & Analytics",
      "Bookmarks",
      "Notes",
      "Settings",
    ]) {
      expect(labels).toContain(required);
    }
  });

  it("has unique hrefs", () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("picks the most specific active item", () => {
    expect(activeNavItem("/learn/manual-testing/some-lesson")?.href).toBe("/learn/manual-testing");
    expect(activeNavItem("/learn")?.href).toBe("/learn");
    expect(activeNavItem("/learning")).toBeUndefined();
  });

  it("searches labels, descriptions and keywords, hiding admin items from learners", () => {
    expect(searchNav("jmeter", false).map((i) => i.href)).toEqual(["/learn/performance", "/learn/jmeter"]);
    expect(searchNav("admin", false)).toHaveLength(0);
    expect(searchNav("admin", true).map((i) => i.href)).toContain("/admin");
  });
});

describe("buildCrumbs", () => {
  it("uses nav labels and title-cases unknown segments", () => {
    expect(buildCrumbs("/learn/manual-testing/boundary-value-analysis")).toEqual([
      { href: "/learn", label: "Learning Center" },
      { href: "/learn/manual-testing", label: "Manual Testing" },
      { href: "/learn/manual-testing/boundary-value-analysis", label: "Boundary Value Analysis" },
    ]);
  });
});
