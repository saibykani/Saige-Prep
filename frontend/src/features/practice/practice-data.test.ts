import { describe, expect, it } from "vitest";
import { allTopics } from "@/content/curriculum";
import { choiceQuestion } from "@/content/schema";
import { CODE_CHALLENGES } from "./code-challenges";
import { mean, PERF_EXERCISES, percentile, SAMPLE_MS } from "./performance-data";

const topics = new Set(allTopics().map((t) => t.slug));

describe("code challenges", () => {
  it.each(CODE_CHALLENGES.map((c) => [c.id, c] as const))("%s is a valid question with a real topic", (_id, c) => {
    expect(() => choiceQuestion.parse(c)).not.toThrow();
    expect(topics.has(c.topic), c.topic).toBe(true);
  });

  it("has unique ids", () => {
    expect(new Set(CODE_CHALLENGES.map((c) => c.id)).size).toBe(CODE_CHALLENGES.length);
  });
});

describe("performance lab maths", () => {
  it("matches the worked explanations", () => {
    expect(SAMPLE_MS).toHaveLength(20);
    expect(SAMPLE_MS.reduce((s, v) => s + v, 0)).toBe(6360);
    expect(mean(SAMPLE_MS)).toBe(318);
    expect(percentile(SAMPLE_MS, 50)).toBe(200);
    expect(percentile(SAMPLE_MS, 90)).toBe(510);
    expect(percentile(SAMPLE_MS, 95)).toBe(800);
    expect(SAMPLE_MS.filter((v) => v > 500)).toHaveLength(3);
  });

  it("numeric answers agree with their stated arithmetic", () => {
    const get = (id: string) => PERF_EXERCISES.find((e) => e.id === id)!;
    const n = (id: string) => {
      const e = get(id);
      return e.kind === "number" ? e.answer : NaN;
    };
    expect(n("pf-lab-06")).toBeCloseTo((312 / 24000) * 100, 5);
    expect(Math.abs(n("pf-lab-07") - 24000 / 900)).toBeLessThan(0.01);
    expect(n("pf-lab-08")).toBe(50 * 0.4);
    expect(n("pf-lab-09")).toBe(100 * (0.5 + 4.5));
  });
});
