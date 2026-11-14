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
    expect(activeNavItem("/careers/testing/manual-testing/some-lesson")?.href).toBe("/careers/testing/manual-testing");
    expect(activeNavItem("/learn")?.href).toBe("/learn");
    expect(activeNavItem("/learning")).toBeUndefined();
  });

  it("searches labels, descriptions and keywords, hiding admin items from learners", () => {
    expect(searchNav("jmeter", false).map((i) => i.href)).toEqual(["/careers/testing/performance", "/careers/testing/jmeter"]);
    expect(searchNav("admin", false)).toHaveLength(0);
    expect(searchNav("admin", true).map((i) => i.href)).toContain("/admin");
  });
});

describe("buildCrumbs", () => {
  it("keeps acronyms in capitals", () => {
    expect(buildCrumbs("/careers/ai-engineering/ai-engineering/building-rag-pipelines").at(-1)?.label).toBe("Building RAG Pipelines");
    expect(buildCrumbs("/careers/testing/specialist/sql-for-testers").at(-1)?.label).toBe("SQL For Testers");
  });

  it("uses nav labels and title-cases unknown segments", () => {
    expect(buildCrumbs("/careers/testing/manual-testing/boundary-value-analysis")).toEqual([
      { href: "/careers", label: "Careers" },
      { href: "/careers/testing", label: "Testing" },
      { href: "/careers/testing/manual-testing", label: "Manual Testing" },
      { href: "/careers/testing/manual-testing/boundary-value-analysis", label: "Boundary Value Analysis" },
    ]);
    expect(buildCrumbs("/careers/non-it").at(-1)?.label).toBe("Non-IT Careers");
  });
});
