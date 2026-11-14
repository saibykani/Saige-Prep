/**
 * Expansion schemas (delivery step 2): domains, careers, roles for any field, exams, aptitude,
 * extended questions and mock definitions. Nothing here is wired into routes or UI yet.
 * Existing schemas in ./schema.ts are untouched and still validate all current content.
 *
 * Accuracy policy (docs/expansion-plan.md section 4): exam objects are strict, so there is
 * no field in which a cut-off, vacancy count or salary figure could be stored.
 */
import { z } from "zod";
import { choiceQuestion, level, reference, role, slug } from "./schema";

/* --------------------------------- Shared pieces --------------------------------- */

/** ISO 3166-1 alpha-2 country code. India first; other countries need no migration. */
export const country = z
  .string()
  .regex(/^[A-Z]{2}$/, "ISO country code, e.g. IN")
  .default("IN");
/** BCP 47-style language tag ("en", "hi", "en-IN"). English first, Hindi ready. */
export const localeTag = z.string().regex(/^[a-z]{2,3}(-[A-Z]{2})?$/, "language tag, e.g. en or hi");
export const locale = localeTag.default("en");
export const SUPPORTED_LOCALES = ["en", "hi"] as const;
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
  .refine((d) => {
    const t = new Date(`${d}T00:00:00Z`);
    return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === d;
  }, "not a real calendar date");

/* ------------------------------ Official-domain list ------------------------------ */

/** Exact hosts (and their subdomains) accepted as official sources. */
export const OFFICIAL_HOSTS = [
  "upsc.gov.in",
  "ssc.gov.in",
  "ssc.nic.in",
  "ibps.in",
  "sbi.co.in",
  "rbi.org.in",
  "rrbcdg.gov.in",
  "joinindianarmy.nic.in",
  "joinindiannavy.gov.in",
  "afcat.cdac.in",
  "ctet.nic.in",
  "licindia.in",
  "newindia.co.in",
  // National testing and professional bodies for the India career catalogue.
  "nta.ac.in",
  "icai.org",
  "icsi.edu",
  "icmai.in",
  "nmc.org.in",
  "natboard.edu.in",
  "consortiumofnlus.ac.in",
  "nludelhi.ac.in",
  "barcouncilofindia.org",
  "jeeadv.ac.in",
  "iimcat.ac.in",
] as const;
/** Domain suffixes accepted for state commissions and government bodies. */
export const OFFICIAL_SUFFIXES = [".gov.in", ".nic.in"] as const;

/** True when the URL is https, has no credentials, and its host is on the allow-list. */
export function isOfficialUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "https:" || u.username || u.password) return false;
  const host = u.hostname.toLowerCase().replace(/\.$/, "");
  if (OFFICIAL_SUFFIXES.some((s) => host.endsWith(s) && host.length > s.length)) return true;
  return OFFICIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}
export const officialUrl = z.string().refine(isOfficialUrl, "must be an https URL on an allow-listed official domain");

export const officialLink = z.strictObject({
  label: z.string().min(3),
  url: officialUrl,
  kind: z.enum(["notification", "syllabus", "pattern", "homepage"]),
});

/* ---------------------------------- Domains ---------------------------------- */

const courseModule = z.object({
  slug,
  title: z.string().min(3),
  description: z.string().min(10).optional(),
  path: z.enum(["core", "optional"]),
  topics: z.array(z.object({ slug, title: z.string().min(3) })),
});

/** content/domains/<domain>.json: any field, IT or non-IT. */
export const domainFile = z
  .strictObject({
    slug,
    title: z.string().min(3),
    kind: z.enum(["it", "non-it"]),
    country,
    locale,
    summary: z.string().min(20),
    icon: z.string().min(2).optional(),
    accent: z.enum(["teal", "indigo", "coral", "plum"]).optional(),
    roleGroups: z.array(z.strictObject({ id: slug, label: z.string().min(3) })).min(1),
    courses: z
      .array(
        z.strictObject({
          slug,
          title: z.string().min(3),
          description: z.string().min(10),
          level,
          /** Sub-course shown as a tab inside its parent course (e.g. JMeter inside Performance). */
          parent: slug.optional(),
          modules: z.array(courseModule),
        }),
      )
      .default([]),
  })
  .superRefine((d, ctx) => {
    const ids = d.roleGroups.map((g) => g.id);
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "duplicate roleGroups id" });
    const cs = d.courses.map((c) => c.slug);
    if (new Set(cs).size !== cs.length) ctx.addIssue({ code: "custom", message: "duplicate course slug" });
  });
export type DomainFile = z.infer<typeof domainFile>;

/* ------------------------------ Roles and careers ------------------------------ */

/** Detailed role (IT style): the existing role shape with domain + group instead of the testing enum. */
export const domainRole = role.omit({ category: true }).extend({
  domain: slug,
  group: slug,
  /** Free text only, and only with a source. No figures without provenance. */
  salaryNote: z.strictObject({ text: z.string().min(10), source: officialUrl }).optional(),
  relatedExams: z.array(slug).default([]),
});
export type DomainRole = z.infer<typeof domainRole>;

/** Overview-level career (non-IT, professional paths): no lessons, honest and short. */
export const careerOverview = z.strictObject({
  slug,
  domain: slug,
  group: slug,
  title: z.string().min(3),
  country,
  locale,
  overview: z.string().min(40),
  responsibilities: z.array(z.string().min(5)).min(2),
  eligibility: z.string().min(10),
  /** Qualifying exams, each with official links and a verification date. */
  qualifyingExams: z
    .array(z.strictObject({ exam: slug.optional(), title: z.string().min(2), links: z.array(officialLink).min(1), lastVerified: isoDate }))
    .default([]),
  studyRoute: z.array(z.strictObject({ step: z.string().min(3), detail: z.string().min(10) })).min(1),
  relatedExams: z.array(slug).default([]),
  nextRoles: z.array(slug).default([]),
  references: z.array(reference).default([]),
});
export type CareerOverview = z.infer<typeof careerOverview>;

/* ------------------------------------ Exams ------------------------------------ */

const negativeMarking = z.strictObject({ perWrong: z.number().positive().max(10) }).nullable();

const examSection = z.strictObject({
  id: slug,
  name: z.string().min(2),
  // Optional on purpose: if the official pattern is unreadable the field is omitted, never guessed.
  questions: z.number().int().positive().optional(),
  marks: z.number().positive().optional(),
  durationMin: z.number().positive().optional(),
  negativeMarking: negativeMarking.optional(),
  language: z.array(localeTag).optional(),
});

const examPaper = z
  .strictObject({
    stage: slug,
    id: slug,
    name: z.string().min(2),
    sections: z.array(examSection).min(1),
    totalMarks: z.number().positive().optional(),
    sectionalTiming: z.boolean().default(false),
  })
  .superRefine((p, ctx) => {
    const ids = p.sections.map((s) => s.id);
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: `paper ${p.id}: duplicate section id` });
    if (p.sections.every((s) => s.marks !== undefined) && p.totalMarks !== undefined) {
      const sum = p.sections.reduce((n, s) => n + (s.marks ?? 0), 0);
      if (Math.abs(sum - p.totalMarks) > 1e-9) {
        ctx.addIssue({ code: "custom", message: `paper ${p.id}: totalMarks ${p.totalMarks} != section sum ${sum}` });
      }
    }
    if (p.sectionalTiming && p.sections.some((s) => s.durationMin === undefined)) {
      ctx.addIssue({ code: "custom", message: `paper ${p.id}: sectionalTiming needs durationMin on every section` });
    }
  });

export type SyllabusNode = {
  id: string;
  title: string;
  children?: SyllabusNode[];
  topicRefs?: { type: "aptitude" | "lesson" | "gk"; slug: string }[];
  /** Official wording, quoted not paraphrased. */
  officialText?: string;
};
export const syllabusNode: z.ZodType<SyllabusNode> = z.lazy(() =>
  z.strictObject({
    id: slug,
    title: z.string().min(2),
    children: z.array(syllabusNode).optional(),
    topicRefs: z.array(z.strictObject({ type: z.enum(["aptitude", "lesson", "gk"]), slug })).optional(),
    officialText: z.string().min(3).optional(),
  }),
);

export function syllabusIds(nodes: SyllabusNode[]): string[] {
  return nodes.flatMap((n) => [n.id, ...syllabusIds(n.children ?? [])]);
}

/** One official previous paper / answer key link, by year, stage and shift. */
export const previousPaperLink = z.strictObject({
  year: z.number().int().min(1990).max(2100),
  stage: slug,
  shift: z.string().min(1).max(40).optional(),
  kind: z.enum(["question-paper", "answer-key", "response-sheet", "notice"]),
  label: z.string().min(3),
  url: officialUrl,
  lastVerified: isoDate,
});
export type PreviousPaperLink = z.infer<typeof previousPaperLink>;

/** Wording that would present a practice paper as the real one. Never allowed on modelled papers. */
export const REAL_PAPER_CLAIM = /\b(official|actual|real|genuine|authentic|leaked)\b|previous[- ]year (paper|question)|\bPYQ\b/i;

/** An original, year-modelled practice paper. The literal `kind` and disclaimer cannot be dropped. */
export const modelledPracticePaper = z
  .strictObject({
    kind: z.literal("modelled-on"),
    slug,
    modelledOnYear: z.number().int().min(1990).max(2100),
    paper: slug,
    title: z.string().min(5),
    disclaimer: z
      .string()
      .refine(
        (s) => /modelled on/i.test(s) && /not the (real|official|actual)/i.test(s),
        'must say "modelled on" and "not the real/official/actual paper"',
      ),
    mock: slug.optional(),
  })
  .superRefine((m, ctx) => {
    if (REAL_PAPER_CLAIM.test(m.title)) {
      ctx.addIssue({ code: "custom", path: ["title"], message: "modelled papers must not be labelled as the real paper" });
    }
    if (!/modelled on/i.test(m.title)) ctx.addIssue({ code: "custom", path: ["title"], message: 'title must contain "modelled on"' });
  });
export type ModelledPracticePaper = z.infer<typeof modelledPracticePaper>;

export const examFile = z
  .strictObject({
    slug,
    family: slug,
    title: z.string().min(3),
    shortTitle: z.string().min(2),
    conductingBody: z.string().min(2),
    country,
    locale,
    /** Languages the exam is offered in. */
    languages: z.array(localeTag).min(1).default(["en"]),
    level: z.enum(["central", "state", "psu", "national", "professional"]),
    summary: z.string().min(20),
    eligibility: z.strictObject({
      age: z.strictObject({ text: z.string().min(3) }).optional(),
      education: z.strictObject({ text: z.string().min(3) }).optional(),
      nationality: z.strictObject({ text: z.string().min(3) }).optional(),
      attempts: z.strictObject({ text: z.string().min(3) }).optional(),
      other: z.strictObject({ text: z.string().min(3) }).optional(),
    }),
    stages: z
      .array(
        z.strictObject({
          id: slug,
          name: z.string().min(2),
          mode: z.enum(["cbt", "written", "physical", "interview", "document"]),
          qualifying: z.boolean(),
          durationMin: z.number().positive().optional(),
          notes: z.string().optional(),
        }),
      )
      .min(1),
    papers: z.array(examPaper).default([]),
    syllabus: z.array(syllabusNode).default([]),
    studyPath: z
      .array(
        z.strictObject({
          phase: z.number().int().positive(),
          title: z.string().min(3),
          weeks: z.number().positive().optional(),
          nodes: z.array(slug),
          focus: z.string().min(3),
        }),
      )
      .default([]),
    source: z.strictObject({
      notificationYear: z.number().int().min(2000).max(2100),
      officialLinks: z.array(officialLink).min(1),
      lastVerified: isoDate,
      verifiedBy: z.enum(["owner", "agent"]),
      changesToWatch: z.string().optional(),
    }),
    previousPapers: z.array(previousPaperLink).default([]),
    practicePapers: z.array(modelledPracticePaper).default([]),
  })
  .superRefine((e, ctx) => {
    const add = (message: string) => ctx.addIssue({ code: "custom", message });
    if (!e.source.officialLinks.some((l) => l.kind === "notification" || l.kind === "syllabus")) {
      add("source.officialLinks needs at least one notification or syllabus link");
    }
    const stageIds = e.stages.map((s) => s.id);
    if (new Set(stageIds).size !== stageIds.length) add("duplicate stage id");
    for (const p of e.papers) if (!stageIds.includes(p.stage)) add(`paper ${p.id}: unknown stage ${p.stage}`);
    for (const p of e.previousPapers) if (!stageIds.includes(p.stage)) add(`previousPapers: unknown stage ${p.stage}`);
    const paperIds = e.papers.map((p) => p.id);
    if (new Set(paperIds).size !== paperIds.length) add("duplicate paper id");
    for (const m of e.practicePapers) if (!paperIds.includes(m.paper)) add(`practicePapers ${m.slug}: unknown paper ${m.paper}`);
    const ids = syllabusIds(e.syllabus);
    if (new Set(ids).size !== ids.length) add("duplicate syllabus node id");
    for (const sp of e.studyPath) for (const n of sp.nodes) if (!ids.includes(n)) add(`studyPath: unknown syllabus node ${n}`);
  });
export type ExamFile = z.infer<typeof examFile>;

/* ---------------------------------- Aptitude ---------------------------------- */

export const APTITUDE_SUBJECTS = [
  "quantitative",
  "reasoning",
  "verbal",
  "general-awareness",
  "computer-awareness",
  "data-interpretation",
  "current-affairs",
] as const;

/** Frontmatter of content/aptitude/<subject>/<topic>.md */
export const aptitudeTopicFrontmatter = z.strictObject({
  slug,
  subject: z.enum(APTITUDE_SUBJECTS),
  title: z.string().min(3),
  summary: z.string().min(20).max(300),
  level,
  locale,
  duration: z.number().int().min(5).max(180),
  tags: z.array(slug).min(1),
  objectives: z.array(z.string().min(5)).min(2),
  related: z.array(slug).default([]),
  references: z.array(reference).default([]),
  takeaways: z.array(z.string().min(5)).min(2),
});
export type AptitudeTopicFrontmatter = z.infer<typeof aptitudeTopicFrontmatter>;
export const APTITUDE_REQUIRED_HEADINGS = ["Concept", "Method", "Worked examples", "Common traps"] as const;

/** content/aptitude/<subject>/_subject.json */
export const aptitudeSubjectFile = z.strictObject({
  subject: z.enum(APTITUDE_SUBJECTS),
  title: z.string().min(3),
  topics: z.array(slug).min(1),
});

/* ------------------------- Extended questions and banks ------------------------- */

/** A normal choice question plus optional exam/aptitude context. Existing questions remain valid as-is. */
export const extendedQuestion = z.intersection(
  choiceQuestion,
  z.object({
    /** Exam section id this question belongs to. */
    section: slug.optional(),
    /** Shared passage (reading comprehension, data-interpretation sets). */
    passageId: slug.optional(),
    image: z
      .strictObject({ path: z.string().regex(/^\/?[\w./-]+\.(png|jpg|jpeg|svg|webp)$/i, "image path"), alt: z.string().min(5) })
      .optional(),
    locale: localeTag.optional(),
    /** Original look-alikes only (owner decision); there is deliberately no "official PYQ" source. */
    source: z.enum(["original", "adapted"]).default("original"),
    /** Year of the exam pattern this question mirrors; never a claim that it is that year's question. */
    modelledOnYear: z.number().int().min(1990).max(2100).optional(),
  }),
);
export type ExtendedQuestion = z.infer<typeof extendedQuestion>;

export const bankScope = z
  .strictObject({
    domain: slug.optional(),
    course: slug.optional(),
    subject: z.enum(APTITUDE_SUBJECTS).optional(),
    exam: slug.optional(),
  })
  .refine((s) => Object.values(s).some((v) => v !== undefined), "scope needs at least one of domain, course, subject, exam");

export const questionBankV2 = z
  .object({
    bank: slug,
    title: z.string().min(3),
    scope: bankScope,
    locale,
    passages: z.array(z.strictObject({ id: slug, text: z.string().min(30) })).default([]),
    questions: z.array(extendedQuestion).min(5),
  })
  .superRefine((b, ctx) => {
    const pids = new Set(b.passages.map((p) => p.id));
    for (const q of b.questions) {
      if (q.passageId && !pids.has(q.passageId)) ctx.addIssue({ code: "custom", message: `${q.id}: unknown passageId` });
    }
    const qids = b.questions.map((q) => q.id);
    if (new Set(qids).size !== qids.length) ctx.addIssue({ code: "custom", message: "duplicate question id" });
  });
export type QuestionBankV2 = z.infer<typeof questionBankV2>;

/* ----------------------------------- Mocks ----------------------------------- */

export const mockDefinition = z
  .strictObject({
    slug,
    exam: slug,
    title: z.string().min(5),
    locale,
    sections: z
      .array(
        z.strictObject({
          examSection: slug,
          pick: z.strictObject({
            topics: z.array(slug).min(1),
            count: z.number().int().positive(),
            difficultyMix: z
              .strictObject({ beginner: z.number().min(0), intermediate: z.number().min(0), advanced: z.number().min(0) })
              .optional(),
          }),
        }),
      )
      .min(1),
    durationMin: z.number().positive(),
    marking: z.strictObject({ perCorrect: z.number().positive(), perWrong: z.number().min(0) }),
    seed: z.number().int().min(0),
    /** Set for year-style papers: "modelled on" wording is enforced, as for modelledPracticePaper. */
    modelledOnYear: z.number().int().min(1990).max(2100).optional(),
  })
  .superRefine((m, ctx) => {
    for (const s of m.sections) {
      const mix = s.pick.difficultyMix;
      if (mix && Math.abs(mix.beginner + mix.intermediate + mix.advanced - 1) > 1e-6) {
        ctx.addIssue({ code: "custom", message: `section ${s.examSection}: difficultyMix must sum to 1` });
      }
    }
    if (m.modelledOnYear !== undefined && (REAL_PAPER_CLAIM.test(m.title) || !/modelled on/i.test(m.title))) {
      ctx.addIssue({ code: "custom", path: ["title"], message: 'year-style mocks must say "modelled on" and never claim to be the real paper' });
    }
  });
export type MockDefinition = z.infer<typeof mockDefinition>;
