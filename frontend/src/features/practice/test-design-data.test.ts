import { describe, expect, it } from "vitest";
import { DESIGN_EXERCISES, loanDecision, parseValues, pinState, sameValues } from "./test-design-data";

describe("test design answer keys", () => {
  it("has unique ids", () => {
    const ids = DESIGN_EXERCISES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("loan decision table follows the stated rule", () => {
    expect(loanDecision(true, true, false)).toBe("Approve");
    expect(loanDecision(true, false, true)).toBe("Manual review");
    expect(loanDecision(true, false, false)).toBe("Reject");
    expect(loanDecision(false, true, true)).toBe("Reject");
    const table = DESIGN_EXERCISES.find((e) => e.id === "td-05");
    expect(table?.kind === "decision-table" && table.rules.length).toBe(8);
  });

  it("PIN state machine blocks on the third wrong PIN and ignores later events", () => {
    expect(pinState(["wrong PIN", "wrong PIN", "correct PIN"])).toBe("Access granted");
    expect(pinState(["wrong PIN", "wrong PIN", "wrong PIN"])).toBe("Card blocked");
    expect(pinState(["wrong PIN", "wrong PIN", "wrong PIN", "correct PIN"])).toBe("Card blocked");
  });

  it("every classify answer is one of its categories, and multi answers are in range", () => {
    for (const e of DESIGN_EXERCISES) {
      if (e.kind === "classify") for (const item of e.items) expect(e.categories).toContain(item.answer);
      if (e.kind === "multi") for (const i of e.answer) expect(i).toBeLessThan(e.options.length);
    }
  });
});

describe("value parsing and comparison", () => {
  it("parses comma/space separated values and compares as sets at 2-decimal precision", () => {
    expect(parseValues("17, 18 65;66")).toEqual([17, 18, 65, 66]);
    expect(parseValues("a, 2")).toBeNull();
    expect(sameValues([99.99, 100, 499.99, 500], [500, 100.0, 99.99, 499.99])).toBe(true);
    expect(sameValues([17, 18, 65, 66], [17, 18, 65])).toBe(false);
  });
});
