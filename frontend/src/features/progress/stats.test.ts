import { describe, expect, it } from "vitest";
import type { AssessmentAttempt } from "@/lib/store";
import { accuracyByTopic, activityByDay, dayKey, shiftDay, streaks } from "./stats";

const at = (y: number, m: number, d: number) => ({ at: new Date(y, m - 1, d, 12).toISOString() });

describe("streaks", () => {
  it("counts the current run ending today and the longest run", () => {
    const days = activityByDay([at(2026, 1, 1), at(2026, 1, 2), at(2026, 1, 3), at(2026, 1, 9), at(2026, 1, 10), at(2026, 1, 10)]);
    expect(days.get("2026-01-10")).toBe(2);
    expect(streaks(days, "2026-01-10")).toEqual({ current: 2, longest: 3 });
  });

  it("keeps the streak alive until today ends, then breaks", () => {
    const days = activityByDay([at(2026, 1, 9)]);
    expect(streaks(days, "2026-01-10").current).toBe(1);
    expect(streaks(days, "2026-01-11").current).toBe(0);
  });

  it("is zero with no activity and shifts across month ends", () => {
    expect(streaks(new Map(), "2026-01-10")).toEqual({ current: 0, longest: 0 });
    expect(shiftDay("2026-03-01", -1)).toBe("2026-02-28");
    expect(dayKey(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

describe("accuracyByTopic", () => {
  it("aggregates results across attempts, weakest first", () => {
    const r = (topic: string, correct: boolean) => ({ questionId: topic, topic, selected: [0], correct, flagged: false });
    const attempt = { results: [r("x", true), r("y", false), r("x", false)] } as AssessmentAttempt;
    expect(accuracyByTopic([attempt, attempt])).toEqual([
      { topic: "y", correct: 0, total: 2 },
      { topic: "x", correct: 2, total: 4 },
    ]);
  });
});
