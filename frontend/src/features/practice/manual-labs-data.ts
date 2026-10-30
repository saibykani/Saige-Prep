/** Content for the requirements-review and defect-report labs (self-evaluated with expert answers). */

export interface RequirementsExercise {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  story: string;
  acceptance: string[];
  /** What an experienced tester would raise in refinement. */
  findings: { kind: "Ambiguity" | "Missing requirement" | "Edge case" | "Testability" | "Security" | "Accessibility"; text: string }[];
}

export const REQUIREMENTS_EXERCISES: RequirementsExercise[] = [
  {
    id: "rq-01",
    title: "Password reset",
    level: "beginner",
    story: "As a registered user, I want to reset my password so that I can regain access to my account.",
    acceptance: [
      "User clicks 'Forgot password' and enters their email.",
      "A reset link is emailed to the user.",
      "The link lets the user set a new password.",
    ],
    findings: [
      { kind: "Ambiguity", text: "How long is the reset link valid? Can it be used more than once?" },
      { kind: "Security", text: "What does the page say for an email that isn't registered? It should not reveal whether an account exists (user enumeration)." },
      { kind: "Missing requirement", text: "Password rules for the new password are not stated (length, complexity, reuse of old passwords)." },
      { kind: "Security", text: "Are existing sessions signed out after a reset? Is there rate limiting on reset requests?" },
      { kind: "Edge case", text: "What if the user requests several links — do older links stop working?" },
      { kind: "Missing requirement", text: "Is a confirmation email sent after the password changes?" },
    ],
  },
  {
    id: "rq-02",
    title: "Product search",
    level: "beginner",
    story: "As a shopper, I want to search for products so that I can quickly find what I want to buy.",
    acceptance: ["Search results are shown as the user types.", "Results are relevant.", "Search is fast."],
    findings: [
      { kind: "Testability", text: "'Relevant' and 'fast' are not testable. Define a ranking rule and a target such as p95 < 500 ms for results." },
      { kind: "Ambiguity", text: "After how many characters does search start? Is there a debounce?" },
      { kind: "Edge case", text: "No results, special characters, very long queries, leading/trailing spaces, different letter case and misspellings." },
      { kind: "Missing requirement", text: "Pagination or result limits, sorting options, and out-of-stock products — shown or hidden?" },
      { kind: "Accessibility", text: "Are live results announced to screen-reader users, and can results be navigated by keyboard?" },
    ],
  },
  {
    id: "rq-03",
    title: "Order cancellation",
    level: "intermediate",
    story: "As a customer, I want to cancel my order so that I get my money back if I change my mind.",
    acceptance: ["Customers can cancel orders.", "The money is refunded."],
    findings: [
      { kind: "Missing requirement", text: "Which order statuses can be cancelled (PLACED, PAID, SHIPPED…)? What happens after shipping?" },
      { kind: "Ambiguity", text: "Full or partial cancellation for multi-item orders?" },
      { kind: "Missing requirement", text: "Refund timing and method (original payment method? store credit?), and how coupons or shipping fees are handled." },
      { kind: "Edge case", text: "Cancelling twice, or cancelling at the same moment the warehouse ships (race condition)." },
      { kind: "Edge case", text: "Payment provider failure during refund — is the order left in a consistent state, and is the refund retried idempotently?" },
      { kind: "Missing requirement", text: "Inventory restock and customer notification after cancellation." },
    ],
  },
  {
    id: "rq-04",
    title: "Profile photo upload",
    level: "intermediate",
    story: "As a user, I want to upload a profile photo so that others can recognise me.",
    acceptance: ["User can upload an image.", "The image appears on their profile."],
    findings: [
      { kind: "Missing requirement", text: "Allowed file types and maximum file size; the behaviour and message when they're exceeded." },
      { kind: "Security", text: "Server-side validation of the real file content (not just the extension), removal of EXIF metadata such as GPS location, and safe file names (path traversal)." },
      { kind: "Ambiguity", text: "Cropping or resizing rules, and how non-square images are displayed." },
      { kind: "Edge case", text: "Upload interrupted by a network loss, a 0-byte file, an image with very large dimensions, and replacing an existing photo." },
      { kind: "Accessibility", text: "Alt text for the profile image, and a keyboard-accessible upload control." },
    ],
  },
];

export interface DefectExercise {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  scenario: string;
  observed: string[];
  model: {
    title: string;
    environment: string;
    steps: string[];
    expected: string;
    actual: string;
    severity: "Critical" | "Major" | "Minor" | "Trivial";
    priority: "P1" | "P2" | "P3" | "P4";
    rationale: string;
  };
}

export const DEFECT_EXERCISES: DefectExercise[] = [
  {
    id: "df-01",
    title: "Coupon applied twice",
    level: "beginner",
    scenario: "You are testing checkout on build 4.12.0 (staging, Chrome 130 on Windows 11). The coupon SAVE10 should take 10% off the order once.",
    observed: [
      "Cart total is ₹1,000.00.",
      "You apply SAVE10 — the total becomes ₹900.00 (correct).",
      "You click 'Apply' again — the total becomes ₹810.00.",
      "Paying succeeds at ₹810.00.",
    ],
    model: {
      title: "Checkout: SAVE10 coupon can be applied twice, giving 19% off instead of 10%",
      environment: "Staging, build 4.12.0, Chrome 130, Windows 11",
      steps: ["Add items worth ₹1,000.00 to the cart", "Go to checkout and enter coupon SAVE10", "Click Apply", "Click Apply again", "Complete payment"],
      expected: "The coupon applies once. A second Apply shows 'Coupon already applied' and the total stays ₹900.00.",
      actual: "The discount stacks: the total drops to ₹810.00 and payment succeeds at that amount.",
      severity: "Major",
      priority: "P1",
      rationale: "Direct revenue loss that anyone can repeat. Not Critical because checkout still works, but it should be fixed before release — hence P1.",
    },
  },
  {
    id: "df-02",
    title: "Typo on Help page",
    level: "beginner",
    scenario: "Build 4.12.0, production-like staging. On the Help page footer the text reads 'Contcat support'.",
    observed: ["Open /help.", "Scroll to the footer.", "The link label reads 'Contcat support'; the link works."],
    model: {
      title: "Help page: footer link label misspelled as 'Contcat support'",
      environment: "Staging, build 4.12.0, all browsers",
      steps: ["Open /help", "Scroll to the footer"],
      expected: "The link reads 'Contact support'.",
      actual: "The link reads 'Contcat support'. The link target works correctly.",
      severity: "Trivial",
      priority: "P3",
      rationale: "Cosmetic and the function works. Priority is still not the lowest, because it is visible and cheap to fix — severity and priority are independent.",
    },
  },
  {
    id: "df-03",
    title: "Other user's invoice",
    level: "intermediate",
    scenario: "Testing the account area on build 4.12.0 (staging) with your own test accounts A and B. Account A's invoice URL is /invoices/1042.",
    observed: [
      "Log in as test account B.",
      "Change the URL to /invoices/1042.",
      "Account A's invoice is displayed, including name, address and the last 4 card digits.",
    ],
    model: {
      title: "Invoices: any logged-in user can view another user's invoice by changing the ID in the URL (IDOR)",
      environment: "Staging, build 4.12.0, API and web, test accounts A and B",
      steps: [
        "Log in as test account A and note the URL of one invoice (e.g. /invoices/1042)",
        "Log out and log in as test account B",
        "Open /invoices/1042 directly",
      ],
      expected: "403 Forbidden (or 404) — users can only see their own invoices.",
      actual: "Account A's invoice is shown to account B, including name, address and card last 4 digits.",
      severity: "Critical",
      priority: "P1",
      rationale: "Personal data exposure through broken access control. Report it privately via the security process — don't share real customer data, and test only with your own accounts.",
    },
  },
];

const VAGUE = /\b(not working|doesn'?t work|broken|issue|problem|bug|error|wrong)\b/i;

/** Objective checks only: structure and completeness. Quality is self-assessed against the model. */
export function lintDefectReport(r: { title: string; environment: string; steps: string; expected: string; actual: string; severity: string; priority: string }) {
  const issues: string[] = [];
  if (r.title.trim().length < 20) issues.push("Make the title more specific (at least ~20 characters): say where, what and the impact.");
  else if (VAGUE.test(r.title) && r.title.trim().split(/\s+/).length < 6) issues.push("The title is vague. Replace words like 'not working' with what actually happens.");
  if (!r.environment.trim()) issues.push("Add the environment and build (e.g. staging, build number, browser and OS).");
  const steps = r.steps.split("\n").map((s) => s.trim()).filter(Boolean);
  if (steps.length < 2) issues.push("Write at least two reproducible steps, one per line.");
  if (!r.expected.trim()) issues.push("State the expected result.");
  if (!r.actual.trim()) issues.push("State the actual result.");
  if (r.expected.trim() && r.expected.trim() === r.actual.trim()) issues.push("Expected and actual results are identical — what's the defect?");
  if (!r.severity) issues.push("Choose a severity.");
  if (!r.priority) issues.push("Choose a priority.");
  return issues;
}

export const DEFECT_QUALITY_CHECKLIST = [
  "My title says where, what and the impact, without vague words",
  "Someone else could reproduce it from my steps alone",
  "Expected and actual results are specific and different",
  "I included environment and build details",
  "I mentioned evidence (screenshot, video, logs, request/response)",
  "My severity and priority match the impact and urgency",
];
