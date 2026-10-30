import { describe, expect, it } from "vitest";
import { isCorrect, scoreAttempt, seededRandom, shuffle } from "./scoring";

const qs = [
  { id: "a", answer: [1], topic: "t1" },
  { id: "b", answer: [0, 2], topic: "t1" },
  { id: "c", answer: [3], topic: "t2" },
  { id: "d", answer: [0], topic: "t2" },
];

describe("isCorrect", () => {
  it("requires the exact set of answers, in any order", () => {
    expect(isCorrect({ answer: [0, 2] }, [2, 0])).toBe(true);
    expect(isCorrect({ answer: [0, 2] }, [0])).toBe(false);
    expect(isCorrect({ answer: [0, 2] }, [0, 1, 2])).toBe(false);
    expect(isCorrect({ answer: [1] }, [])).toBe(false);
    expect(isCorrect({ answer: [1] }, undefined)).toBe(false);
  });
});

describe("scoreAttempt", () => {
  it("counts correct, wrong and unanswered and groups by topic (weakest first)", () => {
    const r = scoreAttempt(qs, { a: [1], b: [0], c: [3] });
    expect(r).toMatchObject({ score: 2, maxScore: 4, correct: 2, wrong: 1, unanswered: 1, accuracy: 0.5 });
    expect(r.byTopic).toEqual([
      { topic: "t1", correct: 1, total: 2 },
      { topic: "t2", correct: 1, total: 2 },
    ]);
  });

  it("applies negative marking only to wrong answers and never goes below zero", () => {
    expect(scoreAttempt(qs, { a: [1], b: [0], c: [0] }, { negativeMarking: 0.25 }).score).toBe(0.5);
    expect(scoreAttempt(qs, { a: [0], b: [1], c: [0], d: [1] }, { negativeMarking: 1 }).score).toBe(0);
    // Unanswered questions are not penalised.
    expect(scoreAttempt(qs, { a: [1] }, { negativeMarking: 0.5 }).score).toBe(1);
  });

  it("supports custom points per question", () => {
    expect(scoreAttempt(qs, { a: [1], d: [0] }, { pointsPerQuestion: 2 })).toMatchObject({ score: 4, maxScore: 8 });
  });
});

describe("shuffle", () => {
  it("is deterministic with a seed and keeps every element", () => {
    const a = shuffle([1, 2, 3, 4, 5, 6], seededRandom(42));
    const b = shuffle([1, 2, 3, 4, 5, 6], seededRandom(42));
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
