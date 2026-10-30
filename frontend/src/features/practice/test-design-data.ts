/** Auto-checkable test design exercises. Answer keys are verified in test-design-data.test.ts. */

export type DesignExercise =
  | {
      id: string;
      title: string;
      level: "beginner" | "intermediate" | "advanced";
      kind: "values";
      requirement: string;
      task: string;
      /** Expected set of values (order ignored). Numbers compared at 2-decimal precision. */
      expected: number[];
      explanation: string;
      hint: string;
    }
  | {
      id: string;
      title: string;
      level: "beginner" | "intermediate" | "advanced";
      kind: "classify";
      requirement: string;
      task: string;
      categories: string[];
      items: { label: string; answer: string }[];
      explanation: string;
      hint: string;
    }
  | {
      id: string;
      title: string;
      level: "beginner" | "intermediate" | "advanced";
      kind: "decision-table";
      requirement: string;
      task: string;
      conditions: string[];
      actions: string[];
      /** One row per rule: condition truth values and the expected action. */
      rules: { values: boolean[]; answer: string }[];
      explanation: string;
      hint: string;
    }
  | {
      id: string;
      title: string;
      level: "beginner" | "intermediate" | "advanced";
      kind: "multi";
      requirement: string;
      task: string;
      options: string[];
      answer: number[];
      explanation: string;
      hint: string;
    }
  | {
      id: string;
      title: string;
      level: "beginner" | "intermediate" | "advanced";
      kind: "number";
      requirement: string;
      task: string;
      answer: number;
      explanation: string;
      hint: string;
    };

const LOAN_RULES = [
  [true, true, true],
  [true, true, false],
  [true, false, true],
  [true, false, false],
  [false, true, true],
  [false, true, false],
  [false, false, true],
  [false, false, false],
] as const;

/** Business rule used for the decision-table exercise (kept in code so tests can verify the key). */
export function loanDecision(score700: boolean, income50k: boolean, existing: boolean) {
  if (score700 && income50k) return "Approve";
  if (score700 && existing) return "Manual review";
  return "Reject";
}

export const PIN_EVENTS = ["correct PIN", "wrong PIN"] as const;

/** State machine for the card PIN exercise: three wrong PINs in a row block the card. */
export function pinState(events: string[]) {
  let state = "Waiting for PIN";
  let wrong = 0;
  for (const e of events) {
    if (state === "Access granted" || state === "Card blocked") break;
    if (e === "correct PIN") state = "Access granted";
    else {
      wrong++;
      state = wrong >= 3 ? "Card blocked" : wrong === 1 ? "1st attempt failed" : "2nd attempt failed";
    }
  }
  return state;
}

const PIN_STATES = ["Waiting for PIN", "1st attempt failed", "2nd attempt failed", "Access granted", "Card blocked"];

export const DESIGN_EXERCISES: DesignExercise[] = [
  {
    id: "td-01",
    title: "Age boundaries (two-value)",
    level: "beginner",
    kind: "values",
    requirement: "A sign-up form accepts ages from 18 to 65 inclusive. Ages are whole numbers.",
    task: "Enter the two-value boundary test values, separated by commas.",
    expected: [17, 18, 65, 66],
    explanation: "Each boundary (18 and 65) plus its nearest neighbour in the invalid partition next to it (17 and 66). Off-by-one bugs like `age > 18` are caught by exactly these values.",
    hint: "Two values per edge: the edge itself and the value just outside it.",
  },
  {
    id: "td-02",
    title: "Cart quantity (three-value)",
    level: "beginner",
    kind: "values",
    requirement: "A cart allows a quantity of 1 to 50 per item. Quantities are whole numbers.",
    task: "Enter all three-value boundary test values.",
    expected: [0, 1, 2, 49, 50, 51],
    explanation: "Three-value BVA tests each boundary with both neighbours: 0, 1, 2 at the lower edge and 49, 50, 51 at the upper edge.",
    hint: "For each edge: one below, the edge, one above.",
  },
  {
    id: "td-03",
    title: "Money has decimals",
    level: "intermediate",
    kind: "values",
    requirement: "Free shipping applies to orders from 100.00 to 499.99 (prices have two decimal places).",
    task: "Enter the two-value boundary test values for the free-shipping range.",
    expected: [99.99, 100, 499.99, 500],
    explanation: "With two-decimal precision the neighbour is 0.01 away: 99.99 / 100.00 at the bottom, 499.99 / 500.00 at the top. Using 99 or 501 would miss the real edge.",
    hint: "What is the smallest step between two prices?",
  },
  {
    id: "td-04",
    title: "Which partition?",
    level: "beginner",
    kind: "classify",
    requirement: "A username must be 6 to 15 characters long.",
    task: "Classify each username length into its equivalence partition.",
    categories: ["Invalid: too short", "Valid", "Invalid: too long"],
    items: [
      { label: "0 characters", answer: "Invalid: too short" },
      { label: "5 characters", answer: "Invalid: too short" },
      { label: "6 characters", answer: "Valid" },
      { label: "10 characters", answer: "Valid" },
      { label: "15 characters", answer: "Valid" },
      { label: "16 characters", answer: "Invalid: too long" },
      { label: "40 characters", answer: "Invalid: too long" },
    ],
    explanation: "Three partitions: below 6, 6–15, above 15. One value from each partition is enough for equivalence partitioning; the edges (5/6, 15/16) come from boundary value analysis.",
    hint: "Both 6 and 15 are allowed ('6 to 15' is inclusive).",
  },
  {
    id: "td-05",
    title: "Loan decision table",
    level: "intermediate",
    kind: "decision-table",
    requirement:
      "A loan is approved when the credit score is at least 700 AND income is at least 50,000. If the score is at least 700 but income is lower, existing customers go to manual review; new customers are rejected. Anyone with a score below 700 is rejected.",
    task: "Fill in the action for every rule (combination of conditions).",
    conditions: ["Credit score ≥ 700", "Income ≥ 50,000", "Existing customer"],
    actions: ["Approve", "Manual review", "Reject"],
    rules: LOAN_RULES.map((v) => ({ values: [...v], answer: loanDecision(v[0], v[1], v[2]) })),
    explanation: "Three yes/no conditions give 2³ = 8 rules. Rules 1–2 approve, rule 3 goes to review, and every rule with score < 700 rejects. Notice rules 5–8 share an outcome — they could be collapsed into one rule with 'income' and 'existing' as don't-care.",
    hint: "Start with the score: if it is below 700, nothing else matters.",
  },
  {
    id: "td-06",
    title: "Card PIN state machine",
    level: "intermediate",
    kind: "classify",
    requirement: "An ATM gives three attempts to enter the PIN. A correct PIN grants access. Three wrong PINs in a row block the card. Once access is granted or the card is blocked, further PIN entries are ignored.",
    task: "For each event sequence (starting from 'Waiting for PIN'), choose the final state.",
    categories: PIN_STATES,
    items: [
      ["correct PIN"],
      ["wrong PIN"],
      ["wrong PIN", "correct PIN"],
      ["wrong PIN", "wrong PIN"],
      ["wrong PIN", "wrong PIN", "correct PIN"],
      ["wrong PIN", "wrong PIN", "wrong PIN"],
      ["wrong PIN", "wrong PIN", "wrong PIN", "correct PIN"],
    ].map((events) => ({ label: events.join(" → "), answer: pinState(events) })),
    explanation: "Tracing sequences through a state machine is how state-transition tests are derived. The last sequence is the classic invalid-transition test: a correct PIN after blocking must NOT grant access.",
    hint: "Count consecutive wrong PINs. The third one blocks the card for good.",
  },
  {
    id: "td-07",
    title: "Coupon date boundaries",
    level: "intermediate",
    kind: "multi",
    requirement: "A coupon is valid from 1 March 00:00 to 31 March 23:59 (store time zone). Times have minute precision.",
    task: "Select all two-value boundary test values.",
    options: ["28 Feb 23:59", "1 Mar 00:00", "1 Mar 00:01", "15 Mar 12:00", "31 Mar 23:59", "1 Apr 00:00", "31 Mar 23:58"],
    answer: [0, 1, 4, 5],
    explanation: "With minute precision the neighbours of 1 Mar 00:00 and 31 Mar 23:59 are one minute away: 28 Feb 23:59 and 1 Apr 00:00. 15 Mar is an equivalence-partition value; 00:01 and 23:58 are three-value extras. Also test in the store's time zone — a classic source of off-by-hours bugs.",
    hint: "One minute before the start, the start, the end, one minute after the end.",
  },
  {
    id: "td-08",
    title: "How many pairwise tests?",
    level: "advanced",
    kind: "number",
    requirement: "A web app must be tested on 3 browsers × 2 operating systems × 2 languages.",
    task: "What is the minimum number of test cases that covers every pair of values (pairwise / all-pairs)?",
    answer: 6,
    explanation: "Every browser must meet every OS: 3 × 2 = 6 pairs, so you need at least 6 tests. With an orthogonal arrangement those 6 tests also cover all browser×language and OS×language pairs. Exhaustive testing would need 3 × 2 × 2 = 12.",
    hint: "Multiply the two largest parameter sizes — that's the lower bound.",
  },
  {
    id: "td-09",
    title: "Password length boundaries",
    level: "beginner",
    kind: "values",
    requirement: "Passwords must be 12 to 64 characters long.",
    task: "Enter the two-value boundary test lengths.",
    expected: [11, 12, 64, 65],
    explanation: "The boundaries are on length, not content: 11/12 at the bottom and 64/65 at the top. Keep every other password rule satisfied so a failure is clearly caused by length.",
    hint: "Lengths are whole numbers.",
  },
  {
    id: "td-10",
    title: "Pick the negative tests",
    level: "beginner",
    kind: "multi",
    requirement: "An email field must contain a valid email address; the field is required.",
    task: "Select every input that is a negative (invalid) test.",
    options: ["asha@example.com", "(empty)", "asha@", "asha.example.com", "a@b.co", "  asha@example.com  (with spaces)", "asha@@example.com"],
    answer: [1, 2, 3, 6],
    explanation: "Empty, missing domain, missing @ and double @ must all be rejected. a@b.co is short but valid. Leading/trailing spaces are a design decision — many systems trim them — so clarify the requirement rather than assume.",
    hint: "Which inputs break the basic name@domain shape?",
  },
];

export function sameValues(expected: number[], given: number[]) {
  const norm = (xs: number[]) => [...new Set(xs.map((x) => Math.round(x * 100)))].sort((a, b) => a - b);
  const a = norm(expected);
  const b = norm(given);
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export function parseValues(text: string): number[] | null {
  const parts = text.split(/[\s,;]+/).filter(Boolean);
  if (parts.length === 0) return null;
  const nums = parts.map((p) => Number(p));
  return nums.every((n) => Number.isFinite(n)) ? nums : null;
}
