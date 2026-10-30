import { describe, expect, it } from "vitest";
import { generatePlan, type PlannerLesson, type PlannerRole } from "./plan";

const lesson = (slug: string, minutes: number): PlannerLesson => ({ slug, title: slug, href: `/learn/t/${slug}`, minutes });
const lessons = new Map([lesson("a", 60), lesson("b", 60), lesson("c", 90), lesson("d", 30)].map((l) => [l.slug, l]));
const role: PlannerRole = {
  slug: "r",
  title: "R",
  stages: [
    { title: "Beginner", topics: ["a", "b", "missing"] },
    { title: "Intermediate", topics: ["c", "a", "d"] },
  ],
};

describe("generatePlan", () => {
  it("fills weeks by hour budget in roadmap order and skips unwritten topics", () => {
    const plan = generatePlan(role, lessons, 4, 2);
    expect(plan.tasks.map((t) => [t.title, t.week])).toEqual([
      ["a", 1],
      ["b", 1],
      ["c", 2],
      ["d", 2],
    ]);
    expect(plan.unwritten).toBe(1);
    expect(plan.overflow).toBe(0);
    expect(plan.tasks.every((t) => t.href.startsWith("/learn/"))).toBe(true);
  });

  it("reports lessons that do not fit and skips completed ones", () => {
    const plan = generatePlan(role, lessons, 1, 1, new Set(["a"]));
    expect(plan.tasks.map((t) => t.title)).toEqual(["b"]);
    expect(plan.overflow).toBe(2);
  });

  it("gives an over-long lesson its own week", () => {
    const plan = generatePlan(role, lessons, 3, 1);
    expect(plan.tasks.find((t) => t.title === "c")?.week).toBe(3);
  });
});
