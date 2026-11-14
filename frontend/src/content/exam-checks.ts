/**
 * Test-side checks for exam data (docs/expansion-plan.md section 4). Used by tests only;
 * not imported by app code. Pure functions so tests can inject "now" and sample data.
 */

export const STALE_WARN_MONTHS = 6;
export const STALE_FAIL_MONTHS = 12;

export type Staleness = "ok" | "warn" | "stale" | "future";

/** "future" when after today, "stale" when older than failMonths, "warn" when older than warnMonths. */
export function stalenessOf(lastVerified: string, now: Date, opts: { warnMonths?: number; failMonths?: number } = {}): Staleness {
  const { warnMonths = STALE_WARN_MONTHS, failMonths = STALE_FAIL_MONTHS } = opts;
  if (lastVerified > now.toISOString().slice(0, 10)) return "future";
  if (lastVerified < shiftMonths(now, -failMonths)) return "stale";
  if (lastVerified < shiftMonths(now, -warnMonths)) return "warn";
  return "ok";
}

function shiftMonths(now: Date, delta: number): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + delta, now.getUTCDate()));
  // Clamp overflow (e.g. 31 Aug minus 6 months) to the last day of the target month.
  const target = (((now.getUTCMonth() + delta) % 12) + 12) % 12;
  if (d.getUTCMonth() !== target) d.setUTCDate(0);
  return d.toISOString().slice(0, 10);
}

/** Every verification date an exam carries: its source, plus each previous-paper link. */
export function verificationDates(exam: { source: { lastVerified: string }; previousPapers?: { lastVerified: string; label: string }[] }): { where: string; date: string }[] {
  return [
    { where: "source.lastVerified", date: exam.source.lastVerified },
    ...(exam.previousPapers ?? []).map((p, i) => ({ where: `previousPapers[${i}] (${p.label})`, date: p.lastVerified })),
  ];
}

/** Problems (stale or future dates) for one exam; empty means fine. Warnings are returned separately. */
export function stalenessReport(exam: Parameters<typeof verificationDates>[0], now: Date): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  for (const { where, date } of verificationDates(exam)) {
    const s = stalenessOf(date, now);
    if (s === "future") errors.push(`${where}: ${date} is in the future`);
    else if (s === "stale") errors.push(`${where}: ${date} is older than ${STALE_FAIL_MONTHS} months`);
    else if (s === "warn") warnings.push(`${where}: ${date} is older than ${STALE_WARN_MONTHS} months`);
  }
  return { errors, warnings };
}

/* ------------------------------ Forbidden claims ------------------------------ */

/** Cut-offs, vacancy counts, applicant numbers, salary figures, predicted difficulty, topper claims. */
export const FORBIDDEN_CLAIMS: { name: string; pattern: RegExp }[] = [
  { name: "cut-off", pattern: /cut[\s-]?offs?/i },
  { name: "vacancy count", pattern: /vacanc/i },
  { name: "applicant numbers", pattern: /\b(applicants?|candidates appeared|appeared candidates)\b/i },
  { name: "salary figure", pattern: /\b(salary|salaries|ctc|stipend|pay\s?scale|pay\s?level|in[- ]hand)\b|\bLPA\b|\blakhs?\b|\bcrores?\b|₹|\bINR\b|\bRs\.?\s?\d/i },
  { name: "expected difficulty", pattern: /expected (difficulty|level of difficulty)|difficulty (trend|level this year)/i },
  { name: "topper claim", pattern: /\btoppers?\b|\brank[- ]?holders?\b/i },
];

export type ForbiddenHit = { path: string; claim: string; text: string };

/**
 * Walks every string in an exam object and reports forbidden claims. URL fields are skipped
 * (official links may legitimately contain such words). The plan allowed a quotedFromOfficial
 * exemption; no such field exists in the strict schema, so there is deliberately no exemption.
 */
export function findForbiddenClaims(value: unknown, path = "$"): ForbiddenHit[] {
  if (typeof value === "string") {
    return FORBIDDEN_CLAIMS.filter((c) => c.pattern.test(value)).map((c) => ({ path, claim: c.name, text: value.slice(0, 80) }));
  }
  if (Array.isArray(value)) return value.flatMap((v, i) => findForbiddenClaims(v, `${path}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => (k === "url" ? [] : findForbiddenClaims(v, `${path}.${k}`)));
  }
  return [];
}
