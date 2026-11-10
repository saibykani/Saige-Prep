import { describe, expect, it } from "vitest";
import type { MarkedQuestion } from "@/content/schema";
import { band, scoreMarked, shouldSave } from "./marks";
import { buildJsScript, compareTables, sqlCheckMarks } from "./runners";

const q = (id: string, marks: number, difficulty: MarkedQuestion["difficulty"], answer: number[], type: MarkedQuestion["type"] = "single") =>
  ({ id, marks, difficulty, answer, type, prompt: "Which one is right?", explanation: "Because it is.", topic: "t", options: ["a", "b", "c"] }) as MarkedQuestion;

describe("scoreMarked", () => {
  const questions = [q("a", 1, "beginner", [0]), q("b", 2, "intermediate", [1]), q("c", 3, "advanced", [0, 2], "multiple")];

  it("awards marks only for exactly-right answers", () => {
    const s = scoreMarked(questions, { a: [0], b: [0], c: [0] });
    expect(s).toMatchObject({ earned: 1, total: 6, percent: 17 });
    expect(s.byLevel.advanced).toEqual({ earned: 0, total: 3 });
  });

  it("gives full marks for a perfect paper and none for a blank one", () => {
    expect(scoreMarked(questions, { a: [0], b: [1], c: [2, 0] }).percent).toBe(100);
    expect(scoreMarked(questions, {}).earned).toBe(0);
  });
});

describe("band and saving", () => {
  it("maps percentages to bands", () => {
    expect(band(90).label).toBe("Excellent");
    expect(band(60).label).toBe("Pass");
    expect(band(59).label).toBe("Keep practising");
  });
  it("only saves improvements", () => {
    expect(shouldSave(undefined, 0)).toBe(true);
    expect(shouldSave(70, 60)).toBe(false);
    expect(shouldSave(70, 80)).toBe(true);
  });
});

describe("compareTables", () => {
  const expected = { columns: ["name", "total"], rows: [["Ana", 3], ["Bo", 1.5]] };

  it("accepts the same rows in any order when order does not matter", () => {
    const r = compareTables({ columns: ["NAME", "total"], rows: [["Bo", 1.5], ["Ana", 3.0]] }, expected, false);
    expect(r.every((t) => t.ok)).toBe(true);
  });

  it("flags wrong order separately when order matters", () => {
    const r = compareTables({ columns: ["name", "total"], rows: [["Bo", 1.5], ["Ana", 3]] }, expected, true);
    expect(r.map((t) => t.ok)).toEqual([true, true, false]);
  });

  it("reports wrong columns and missing rows", () => {
    const r = compareTables({ columns: ["name"], rows: [["Ana"]] }, expected, false);
    expect(r.map((t) => t.ok)).toEqual([false, false]);
    expect(r[1].message).toContain("expected 2 row(s), got 1");
  });
});

describe("sqlCheckMarks", () => {
  it("splits marks across checks without losing any", () => {
    for (const total of [1, 2, 3, 4, 5, 7, 10]) {
      expect(sqlCheckMarks(total, false).reduce((a, b) => a + b, 0)).toBe(total);
      expect(sqlCheckMarks(total, true).reduce((a, b) => a + b, 0)).toBe(total);
    }
  });
});

describe("buildJsScript", () => {
  it("runs learner code then each test, isolating failures", async () => {
    const script = buildJsScript("function add(a, b) { return a + b; }\nconsole.log('hi');", [
      { name: "adds", code: "assertEqual(add(2, 3), 5);" },
      { name: "fails", code: "assertEqual(add(2, 2), 5, 'two plus two');" },
    ]);
    const posted: unknown[] = [];
    // Run the generated worker script with a stand-in postMessage.
    await new Function("postMessage", `${script}\n;return new Promise((r) => setTimeout(r, 0));`)((m: unknown) => posted.push(m));
    expect(posted[0]).toEqual({
      stdout: ["hi"],
      error: null,
      results: [
        { name: "adds", ok: true, message: "" },
        { name: "fails", ok: false, message: "two plus two: expected 5, got 4" },
      ],
    });
  });
});
