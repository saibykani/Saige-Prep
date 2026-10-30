/** Pure analytics helpers computed from the learner store. */
import type { AssessmentAttempt, InterviewSession } from "@/lib/store";

/** Local calendar day key, YYYY-MM-DD. */
export function dayKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

export function shiftDay(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d + days));
}

/** Activity count per local day. */
export function activityByDay(activity: { at: string }[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const a of activity) {
    const t = new Date(a.at);
    if (Number.isNaN(t.getTime())) continue;
    const k = dayKey(t);
    out.set(k, (out.get(k) ?? 0) + 1);
  }
  return out;
}

/**
 * Current streak: consecutive active days ending today, or ending yesterday if
 * today has no activity yet. Longest: best run anywhere.
 */
export function streaks(days: Map<string, number>, today: string): { current: number; longest: number } {
  let start = days.has(today) ? today : shiftDay(today, -1);
  let current = 0;
  while (days.has(start)) {
    current++;
    start = shiftDay(start, -1);
  }
  let longest = 0;
  for (const k of days.keys()) {
    if (days.has(shiftDay(k, -1))) continue;
    let run = 0;
    let c = k;
    while (days.has(c)) {
      run++;
      c = shiftDay(c, 1);
    }
    longest = Math.max(longest, run);
  }
  return { current, longest };
}

export interface TopicAccuracy {
  topic: string;
  correct: number;
  total: number;
}

export function accuracyByTopic(attempts: AssessmentAttempt[]): TopicAccuracy[] {
  const map = new Map<string, TopicAccuracy>();
  for (const a of attempts) {
    for (const r of a.results) {
      const e = map.get(r.topic) ?? { topic: r.topic, correct: 0, total: 0 };
      e.total++;
      if (r.correct) e.correct++;
      map.set(r.topic, e);
    }
  }
  return [...map.values()].sort((x, y) => x.correct / x.total - y.correct / y.total);
}

/** Attempts oldest first with accuracy = correct answers / questions. */
export function accuracyOverTime(attempts: AssessmentAttempt[]) {
  return [...attempts]
    .filter((a) => a.results.length > 0)
    .sort((x, y) => x.submittedAt.localeCompare(y.submittedAt))
    .map((a) => ({
      id: a.id,
      title: a.title,
      at: a.submittedAt,
      accuracy: a.results.filter((r) => r.correct).length / a.results.length,
    }));
}

/** Mean self-rating (1–4) per rubric dimension over all answered interview questions. */
export function rubricAverages(sessions: InterviewSession[]): { dimension: string; average: number; count: number }[] {
  const sums = new Map<string, { sum: number; count: number }>();
  for (const s of sessions) {
    for (const a of s.answers) {
      for (const [dim, v] of Object.entries(a.rubric)) {
        const e = sums.get(dim) ?? { sum: 0, count: 0 };
        e.sum += v;
        e.count++;
        sums.set(dim, e);
      }
    }
  }
  return [...sums.entries()].map(([dimension, e]) => ({ dimension, average: e.sum / e.count, count: e.count }));
}
