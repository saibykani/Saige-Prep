import type { MarkedQuestion } from "@/content/schema";
import { isCorrect, type Responses } from "@/lib/scoring";

export interface MarkedScore {
  earned: number;
  total: number;
  /** 0–100, rounded. */
  percent: number;
  byLevel: Record<"beginner" | "intermediate" | "advanced", { earned: number; total: number }>;
}

/** All-or-nothing per question: a question earns its marks only when answered exactly right. */
export function scoreMarked(questions: MarkedQuestion[], responses: Responses): MarkedScore {
  const byLevel = { beginner: { earned: 0, total: 0 }, intermediate: { earned: 0, total: 0 }, advanced: { earned: 0, total: 0 } };
  let earned = 0;
  let total = 0;
  for (const q of questions) {
    const got = isCorrect(q, responses[q.id]) ? q.marks : 0;
    earned += got;
    total += q.marks;
    byLevel[q.difficulty].earned += got;
    byLevel[q.difficulty].total += q.marks;
  }
  return { earned, total, percent: total ? Math.round((earned / total) * 100) : 0, byLevel };
}

export interface Band {
  label: string;
  tone: "success" | "accent" | "warning";
  advice: string;
}

export function band(percent: number): Band {
  if (percent >= 85) return { label: "Excellent", tone: "success", advice: "You have this topic. Move on, and revisit it in a week to keep it fresh." };
  if (percent >= 60) return { label: "Pass", tone: "accent", advice: "Solid. Re-read the explanations for the questions you missed, then retake the test." };
  return { label: "Keep practising", tone: "warning", advice: "Re-read the lesson sections behind the missed questions, then try again. Most learners need two or three passes." };
}

/** Saved scores only ever go up: a retake that scores lower does not overwrite the best result. */
export function shouldSave(previousBest: number | undefined, percent: number): boolean {
  return previousBest === undefined || percent > previousBest;
}
