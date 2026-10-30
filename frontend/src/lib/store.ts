"use client";

/**
 * Learner data store (progress, bookmarks, notes, attempts, plan, activity).
 *
 * Login is disabled and the hosted backend is not reachable, so learner data is kept in
 * this browser's localStorage (see docs/architecture.md, "Learner data"). Everything is
 * schema-validated on load, versioned, exportable and importable, and works (in memory)
 * even when storage is blocked.
 */
import { useSyncExternalStore } from "react";
import { z } from "zod";

const STORAGE_KEY = "saige-prep:data";
export const STORE_VERSION = 1;

const iso = z.string();

const lessonProgress = z.object({
  status: z.enum(["in-progress", "completed"]),
  firstViewedAt: iso,
  lastViewedAt: iso,
  completedAt: iso.optional(),
  quizScore: z.number().min(0).max(1).optional(),
});

const bookmark = z.object({
  id: z.string(),
  kind: z.enum(["lesson", "role", "question", "project", "tool", "interview"]),
  title: z.string(),
  href: z.string(),
  addedAt: iso,
});

const note = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  lessonSlug: z.string().optional(),
  createdAt: iso,
  updatedAt: iso,
});

const questionResult = z.object({
  questionId: z.string(),
  topic: z.string(),
  selected: z.array(z.number()),
  correct: z.boolean(),
  flagged: z.boolean().default(false),
});

const assessmentAttempt = z.object({
  id: z.string(),
  title: z.string(),
  banks: z.array(z.string()),
  startedAt: iso,
  submittedAt: iso,
  durationSeconds: z.number(),
  timeLimitSeconds: z.number().nullable(),
  negativeMarking: z.number(),
  score: z.number(),
  maxScore: z.number(),
  results: z.array(questionResult),
});

const interviewAnswer = z.object({
  questionId: z.string(),
  answer: z.string(),
  keyPointsHit: z.array(z.number()),
  /** 1–4 per rubric dimension, self-assessed. */
  rubric: z.record(z.string(), z.number().min(1).max(4)),
  seconds: z.number(),
});

const interviewSession = z.object({
  id: z.string(),
  track: z.string(),
  minutes: z.number(),
  startedAt: iso,
  finishedAt: iso,
  answers: z.array(interviewAnswer),
});

const planTask = z.object({
  id: z.string(),
  title: z.string(),
  href: z.string().optional(),
  week: z.number().int().min(1),
  done: z.boolean(),
  doneAt: iso.optional(),
  source: z.enum(["roadmap", "custom", "revision"]),
});

const activity = z.object({
  at: iso,
  kind: z.enum(["lesson-viewed", "lesson-completed", "quiz", "assessment", "interview", "practice", "task"]),
  ref: z.string(),
});

export const storeSchema = z.object({
  version: z.literal(STORE_VERSION),
  profile: z.object({
    targetRole: z.string().optional(),
    weeklyHours: z.number().int().min(1).max(60).default(6),
    onboardedAt: iso.optional(),
  }),
  lessons: z.record(z.string(), lessonProgress),
  bookmarks: z.array(bookmark),
  notes: z.array(note),
  assessments: z.array(assessmentAttempt),
  interviews: z.array(interviewSession),
  /** Question ids answered wrong and not yet re-answered correctly. */
  revision: z.array(z.string()),
  plan: z.object({ startedAt: iso.optional(), tasks: z.array(planTask) }),
  activity: z.array(activity),
  practice: z.record(z.string(), z.object({ completedAt: iso, score: z.number().optional() })),
});

export type StoreData = z.infer<typeof storeSchema>;
export type Bookmark = z.infer<typeof bookmark>;
export type Note = z.infer<typeof note>;
export type AssessmentAttempt = z.infer<typeof assessmentAttempt>;
export type InterviewSession = z.infer<typeof interviewSession>;
export type PlanTask = z.infer<typeof planTask>;
export type ActivityKind = z.infer<typeof activity>["kind"];

export function emptyStore(): StoreData {
  return {
    version: STORE_VERSION,
    profile: { weeklyHours: 6 },
    lessons: {},
    bookmarks: [],
    notes: [],
    assessments: [],
    interviews: [],
    revision: [],
    plan: { tasks: [] },
    activity: [],
    practice: {},
  };
}

/* ------------------------------ storage plumbing ------------------------------ */

let state: StoreData = emptyStore();
let loaded = false;
const listeners = new Set<() => void>();

function readStorage(): StoreData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = storeSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : emptyStore();
  } catch {
    return emptyStore();
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = readStorage();
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      state = readStorage();
      listeners.forEach((l) => l());
    }
  });
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: keep working in memory for this session.
  }
}

export function update(mutator: (draft: StoreData) => StoreData) {
  ensureLoaded();
  state = mutator(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  ensureLoaded();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const SERVER_SNAPSHOT = emptyStore();

/** Subscribe to a slice of the store. Selectors must return stable references (pick existing objects). */
export function useStore<T>(selector: (data: StoreData) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => {
      ensureLoaded();
      return selector(state);
    },
    () => selector(SERVER_SNAPSHOT),
  );
}

export function getStore(): StoreData {
  ensureLoaded();
  return state;
}

/* ---------------------------------- helpers ---------------------------------- */

export const now = () => new Date().toISOString();
export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const MAX_ACTIVITY = 2000;

export function logActivity(data: StoreData, kind: ActivityKind, ref: string): StoreData {
  return { ...data, activity: [...data.activity, { at: now(), kind, ref }].slice(-MAX_ACTIVITY) };
}

/* ---------------------------------- actions ---------------------------------- */

export const actions = {
  viewLesson(slug: string) {
    update((d) => {
      const existing = d.lessons[slug];
      const at = now();
      const lessons = {
        ...d.lessons,
        [slug]: existing ? { ...existing, lastViewedAt: at } : { status: "in-progress" as const, firstViewedAt: at, lastViewedAt: at },
      };
      return logActivity({ ...d, lessons }, "lesson-viewed", slug);
    });
  },

  setLessonCompleted(slug: string, completed: boolean) {
    update((d) => {
      const at = now();
      const existing = d.lessons[slug] ?? { status: "in-progress" as const, firstViewedAt: at, lastViewedAt: at };
      const next = completed
        ? { ...existing, status: "completed" as const, completedAt: at }
        : { ...existing, status: "in-progress" as const, completedAt: undefined };
      const data = { ...d, lessons: { ...d.lessons, [slug]: next } };
      return completed ? logActivity(data, "lesson-completed", slug) : data;
    });
  },

  recordLessonQuiz(slug: string, score: number, wrongIds: string[], rightIds: string[]) {
    update((d) => {
      const at = now();
      const existing = d.lessons[slug] ?? { status: "in-progress" as const, firstViewedAt: at, lastViewedAt: at };
      const revision = [...new Set([...d.revision.filter((id) => !rightIds.includes(id)), ...wrongIds])];
      return logActivity({ ...d, lessons: { ...d.lessons, [slug]: { ...existing, quizScore: score } }, revision }, "quiz", slug);
    });
  },

  toggleBookmark(entry: Omit<Bookmark, "addedAt">) {
    update((d) => {
      const exists = d.bookmarks.some((b) => b.id === entry.id);
      return {
        ...d,
        bookmarks: exists ? d.bookmarks.filter((b) => b.id !== entry.id) : [{ ...entry, addedAt: now() }, ...d.bookmarks],
      };
    });
  },

  saveNote(input: { id?: string; title: string; body: string; lessonSlug?: string }) {
    const id = input.id ?? newId();
    update((d) => {
      const at = now();
      const existing = d.notes.find((n) => n.id === id);
      const saved: Note = existing
        ? { ...existing, title: input.title, body: input.body, updatedAt: at }
        : { id, title: input.title, body: input.body, lessonSlug: input.lessonSlug, createdAt: at, updatedAt: at };
      return { ...d, notes: [saved, ...d.notes.filter((n) => n.id !== id)] };
    });
    return id;
  },

  deleteNote(id: string) {
    update((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== id) }));
  },

  saveAssessment(attempt: AssessmentAttempt) {
    update((d) => {
      const wrong = attempt.results.filter((r) => !r.correct).map((r) => r.questionId);
      const right = attempt.results.filter((r) => r.correct).map((r) => r.questionId);
      const revision = [...new Set([...d.revision.filter((id) => !right.includes(id)), ...wrong])];
      return logActivity({ ...d, assessments: [attempt, ...d.assessments], revision }, "assessment", attempt.id);
    });
  },

  resolveRevision(questionId: string) {
    update((d) => ({ ...d, revision: d.revision.filter((id) => id !== questionId) }));
  },

  saveInterview(session: InterviewSession) {
    update((d) => logActivity({ ...d, interviews: [session, ...d.interviews] }, "interview", session.id));
  },

  completePractice(id: string, score?: number) {
    update((d) => logActivity({ ...d, practice: { ...d.practice, [id]: { completedAt: now(), score } } }, "practice", id));
  },

  setProfile(profile: Partial<StoreData["profile"]>) {
    update((d) => ({ ...d, profile: { ...d.profile, ...profile } }));
  },

  setPlan(tasks: PlanTask[]) {
    update((d) => ({ ...d, plan: { startedAt: d.plan.startedAt ?? now(), tasks } }));
  },

  toggleTask(id: string) {
    update((d) => {
      const tasks = d.plan.tasks.map((t) => (t.id === id ? { ...t, done: !t.done, doneAt: !t.done ? now() : undefined } : t));
      const task = tasks.find((t) => t.id === id);
      const data = { ...d, plan: { ...d.plan, tasks } };
      return task?.done ? logActivity(data, "task", id) : data;
    });
  },

  addTask(task: Omit<PlanTask, "id" | "done">) {
    update((d) => ({ ...d, plan: { ...d.plan, tasks: [...d.plan.tasks, { ...task, id: newId(), done: false }] } }));
  },

  removeTask(id: string) {
    update((d) => ({ ...d, plan: { ...d.plan, tasks: d.plan.tasks.filter((t) => t.id !== id) } }));
  },

  /** Replace everything with an imported backup. Returns an error message on invalid input. */
  importData(json: string): string | null {
    try {
      const parsed = storeSchema.safeParse(JSON.parse(json));
      if (!parsed.success) return "This file is not a valid Saige-Prep backup.";
      update(() => parsed.data);
      return null;
    } catch {
      return "This file is not valid JSON.";
    }
  },

  exportData(): string {
    return JSON.stringify(getStore(), null, 2);
  },

  reset() {
    update(() => emptyStore());
  },
};

/** Test helper: reset module state between tests. */
export function __resetForTests() {
  state = emptyStore();
  loaded = false;
  listeners.clear();
}
