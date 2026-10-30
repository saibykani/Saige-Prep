/**
 * Assessment scoring. Pure functions so they can be unit-tested and, when a backend is
 * connected, moved server-side unchanged (see docs/architecture.md, "Assessments").
 */
import type { ChoiceQuestion } from "@/content/schema";

export type Responses = Record<string, number[]>;

export function isCorrect(question: Pick<ChoiceQuestion, "answer">, selected: number[] | undefined): boolean {
  if (!selected || selected.length === 0) return false;
  const expected = [...question.answer].sort((a, b) => a - b);
  const got = [...new Set(selected)].sort((a, b) => a - b);
  return expected.length === got.length && expected.every((v, i) => v === got[i]);
}

export interface ScoreOptions {
  /** Points per correct answer. */
  pointsPerQuestion?: number;
  /** Points deducted per wrong (answered) question, e.g. 0.25. Unanswered questions never lose points. */
  negativeMarking?: number;
}

export interface TopicScore {
  topic: string;
  correct: number;
  total: number;
}

export interface ScoreResult {
  score: number;
  maxScore: number;
  correct: number;
  wrong: number;
  unanswered: number;
  /** 0–1, based on correct / total (independent of negative marking). */
  accuracy: number;
  byTopic: TopicScore[];
  results: { questionId: string; topic: string; selected: number[]; correct: boolean }[];
}

export function scoreAttempt(
  questions: Pick<ChoiceQuestion, "id" | "answer" | "topic">[],
  responses: Responses,
  { pointsPerQuestion = 1, negativeMarking = 0 }: ScoreOptions = {},
): ScoreResult {
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  const topics = new Map<string, TopicScore>();
  const results = questions.map((q) => {
    const selected = responses[q.id] ?? [];
    const ok = isCorrect(q, selected);
    if (selected.length === 0) unanswered++;
    else if (ok) correct++;
    else wrong++;
    const t = topics.get(q.topic) ?? { topic: q.topic, correct: 0, total: 0 };
    t.total++;
    if (ok) t.correct++;
    topics.set(q.topic, t);
    return { questionId: q.id, topic: q.topic, selected, correct: ok };
  });

  const raw = correct * pointsPerQuestion - wrong * negativeMarking;
  // Round to avoid floating point noise such as 2.7499999.
  const score = Math.max(0, Math.round(raw * 100) / 100);
  return {
    score,
    maxScore: questions.length * pointsPerQuestion,
    correct,
    wrong,
    unanswered,
    accuracy: questions.length ? correct / questions.length : 0,
    byTopic: [...topics.values()].sort((a, b) => a.correct / a.total - b.correct / b.total),
    results,
  };
}

/** Deterministic PRNG (mulberry32) so a seeded shuffle is reproducible in tests. */
export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
