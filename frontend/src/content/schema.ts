/**
 * Content schemas. Every content file under frontend/content/ is validated against these
 * in src/content/content.test.ts, so malformed content fails `npm test` (and CI) instead
 * of rendering broken pages.
 */
import { z } from "zod";

export const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "kebab-case slug");
export const level = z.enum(["beginner", "intermediate", "advanced"]);
export type Level = z.infer<typeof level>;

export const reference = z.object({
  title: z.string().min(3),
  url: z.url().refine((u) => u.startsWith("https://"), "references must use https"),
});

/* ---------------------------------- Questions ---------------------------------- */

const questionBase = {
  id: slug,
  prompt: z.string().min(10),
  explanation: z.string().min(20),
  topic: slug,
  difficulty: level,
  /** Optional code shown with the prompt (output prediction, debugging). */
  code: z.string().optional(),
  codeLanguage: z.string().optional(),
};

export const choiceQuestion = z
  .object({
    ...questionBase,
    type: z.enum(["single", "multiple", "truefalse", "code-output", "debugging", "scenario"]),
    options: z.array(z.string().min(1)).min(2).max(6),
    /** Indexes into options. Exactly one for single/truefalse/code-output/debugging/scenario. */
    answer: z.array(z.number().int().min(0)).min(1),
  })
  .superRefine((q, ctx) => {
    if (q.answer.some((i) => i >= q.options.length)) {
      ctx.addIssue({ code: "custom", message: `${q.id}: answer index out of range` });
    }
    if (q.type !== "multiple" && q.answer.length !== 1) {
      ctx.addIssue({ code: "custom", message: `${q.id}: ${q.type} needs exactly one answer` });
    }
    if (q.type === "truefalse" && (q.options.length !== 2 || q.options[0] !== "True" || q.options[1] !== "False")) {
      ctx.addIssue({ code: "custom", message: `${q.id}: truefalse options must be ["True","False"]` });
    }
    if (new Set(q.answer).size !== q.answer.length) {
      ctx.addIssue({ code: "custom", message: `${q.id}: duplicate answer indexes` });
    }
  });
export type ChoiceQuestion = z.infer<typeof choiceQuestion>;

export const questionBankFile = z.object({
  bank: slug,
  title: z.string().min(3),
  track: slug,
  questions: z.array(choiceQuestion).min(5),
});
export type QuestionBank = z.infer<typeof questionBankFile>;

/* ----------------------------------- Lessons ----------------------------------- */

export const lessonFrontmatter = z.object({
  slug,
  title: z.string().min(3),
  summary: z.string().min(20).max(300),
  level,
  duration: z.number().int().min(5).max(180),
  tags: z.array(slug).min(1),
  objectives: z.array(z.string().min(5)).min(2),
  prerequisites: z.array(z.string().min(2)).default([]),
  related: z.array(slug).default([]),
  references: z.array(reference).min(1),
  interview: z
    .array(z.object({ q: z.string().min(10), a: z.string().min(20) }))
    .min(2),
  practice: z.array(z.string().min(10)).min(1),
  takeaways: z.array(z.string().min(5)).min(2),
  quiz: z.array(choiceQuestion).min(2),
});
export type LessonFrontmatter = z.infer<typeof lessonFrontmatter>;

/** Markdown body headings every lesson must contain (the content contract). */
export const REQUIRED_LESSON_HEADINGS = [
  "Beginner-friendly explanation",
  "Technical explanation",
  "Real-world example",
  "Common mistakes",
] as const;

/* ------------------------------------ Roles ------------------------------------ */

export const ROLE_CATEGORIES = [
  { id: "core-qa", label: "Core QA" },
  { id: "automation", label: "Automation & development-in-test" },
  { id: "api-backend", label: "API & backend testing" },
  { id: "performance", label: "Performance & reliability" },
  { id: "mobile-web", label: "Mobile, web & device testing" },
  { id: "security-specialist", label: "Security & specialist testing" },
  { id: "data-ai", label: "Data, AI & modern engineering" },
  { id: "leadership", label: "Leadership & management" },
] as const;
export const roleCategory = z.enum(ROLE_CATEGORIES.map((c) => c.id) as [string, ...string[]]);

const roadmapStage = z.object({
  title: z.string().min(3),
  goals: z.array(z.string().min(5)).min(2),
  /** Curriculum topic slugs to study at this stage. */
  topics: z.array(slug).default([]),
});

export const role = z.object({
  slug,
  title: z.string().min(3),
  category: roleCategory,
  overview: z.string().min(80),
  responsibilities: z.array(z.string().min(5)).min(4),
  skills: z.object({
    essential: z.array(z.string().min(2)).min(3),
    roleSpecific: z.array(z.string().min(2)).min(2),
    optional: z.array(z.string().min(2)).min(1),
  }),
  prerequisites: z.array(z.string().min(3)).min(1),
  roadmap: z.object({ beginner: roadmapStage, intermediate: roadmapStage, advanced: roadmapStage }),
  tools: z.array(z.string().min(2)).min(2),
  exercises: z.array(z.string().min(10)).min(2),
  sampleProject: z.object({ title: z.string().min(5), description: z.string().min(40) }),
  interviewQuestions: z.array(z.object({ q: z.string().min(10), a: z.string().min(30) })).min(4),
  codingRequirements: z.string().min(10),
  commonMistakes: z.array(z.string().min(10)).min(2),
  readinessCriteria: z.array(z.string().min(10)).min(3),
  nextRoles: z.array(slug).default([]),
  /** Ethical/legal boundary note, required for offensive-security roles. */
  boundaries: z.string().optional(),
});
export type Role = z.infer<typeof role>;
export const roleFile = z.object({ category: roleCategory, roles: z.array(role).min(1) });

/* --------------------------------- Interviews ---------------------------------- */

export const RUBRIC_DIMENSIONS = ["correctness", "depth", "problemSolving", "communication"] as const;

export const interviewQuestion = z.object({
  id: slug,
  kind: z.enum(["technical", "scenario", "coding", "behavioral", "system-design"]),
  difficulty: level,
  question: z.string().min(15),
  followUps: z.array(z.string().min(10)).min(1),
  modelAnswer: z.string().min(80),
  /** What a strong answer must cover; shown as the self-evaluation checklist. */
  keyPoints: z.array(z.string().min(5)).min(3),
  redFlags: z.array(z.string().min(5)).min(1),
  minutes: z.number().int().min(2).max(20),
});
export type InterviewQuestion = z.infer<typeof interviewQuestion>;

export const interviewTrack = z.object({
  track: slug,
  title: z.string().min(3),
  description: z.string().min(30),
  roles: z.array(slug).min(1),
  questions: z.array(interviewQuestion).min(8),
});
export type InterviewTrack = z.infer<typeof interviewTrack>;

/* ---------------------------------- Projects ----------------------------------- */

export const project = z.object({
  slug,
  title: z.string().min(5),
  summary: z.string().min(40),
  level,
  hours: z.number().int().min(1).max(80),
  skills: z.array(z.string().min(2)).min(3),
  roles: z.array(slug).min(1),
  /** Path inside the repo's examples/ folder, if runnable source exists. */
  sourceDir: z.string().optional(),
  /** Verified: the stated command was actually executed successfully. */
  verified: z.object({ command: z.string(), result: z.string(), date: z.string() }).optional(),
});
export type Project = z.infer<typeof project>;
