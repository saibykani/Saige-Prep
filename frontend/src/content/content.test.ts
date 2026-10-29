/**
 * Content validator. `npm run validate:content` checks everything under content/.
 * Set CONTENT_ONLY to a path fragment (e.g. "lessons/api-testing" or "roles/core-qa")
 * to validate just those files — used when several authors work in parallel.
 *
 * Fails on schema errors, broken cross-references, missing contract sections,
 * duplicate ids and raw HTML, so bad content never ships.
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { allTopics } = await import("./curriculum");
const { REQUIRED_LESSON_HEADINGS, interviewTrack, questionBankFile, roleFile, project } = await import("./schema");
const { ROLE_CATALOG, ALL_ROLE_SLUGS } = await import("./role-catalog");
const { CONTENT_DIR, parseLessonFile, readDir, readJson } = await import("./loader");

const ONLY = (process.env.CONTENT_ONLY ?? "").replace(/\\/g, "/");
const selected = (file: string) => !ONLY || file.replace(/\\/g, "/").includes(ONLY);
const topicSlugs = new Set(allTopics().map((t) => t.slug));
const roleSlugs = new Set(ALL_ROLE_SLUGS);

const lessonFiles = readDir(path.join(CONTENT_DIR, "lessons"), ".md").filter(selected);
const roleFiles = readDir(path.join(CONTENT_DIR, "roles"), ".json").filter(selected);
const bankFiles = readDir(path.join(CONTENT_DIR, "questions"), ".json").filter(selected);
const interviewFiles = readDir(path.join(CONTENT_DIR, "interviews"), ".json").filter(selected);
const rel = (file: string) => path.relative(CONTENT_DIR, file).replace(/\\/g, "/");

describe("curriculum", () => {
  it("has globally unique topic slugs", () => {
    const slugs = allTopics().map((t) => t.slug);
    expect(slugs.length).toBe(new Set(slugs).size);
  });
  it("role catalogue has unique slugs", () => {
    expect(roleSlugs.size).toBe(ALL_ROLE_SLUGS.length);
  });
});

describe("lessons", () => {
  it("loaded", () => expect(Array.isArray(lessonFiles)).toBe(true));

  it.each(lessonFiles.map((f) => [rel(f), f] as const))("%s meets the content contract", (_name, file) => {
    const lesson = parseLessonFile(file); // throws with a precise message on schema errors
    const expectedTrack = rel(file).split("/")[1];
    expect(lesson.track, `${lesson.slug} is in the wrong track folder`).toBe(expectedTrack);
    expect(path.basename(file, ".md"), "file name must equal slug").toBe(lesson.slug);
    for (const heading of REQUIRED_LESSON_HEADINGS) {
      expect(lesson.body, `${lesson.slug} missing "## ${heading}"`).toMatch(new RegExp(`^## ${heading}\\s*$`, "m"));
    }
    expect(lesson.words, `${lesson.slug} body is too thin (${lesson.words} words)`).toBeGreaterThanOrEqual(500);
    for (const related of lesson.related) expect(topicSlugs.has(related), `${lesson.slug} related ${related}`).toBe(true);
    for (const q of lesson.quiz) expect(topicSlugs.has(q.topic), `${q.id} topic ${q.topic}`).toBe(true);
    expect(lesson.body, `${lesson.slug} contains raw HTML`).not.toMatch(/<(script|iframe|img|div|span|style)\b/i);
    for (const [, href] of lesson.body.matchAll(/\]\((\/learn\/[^)\s#]+)/g)) {
      const target = href.split("/").pop() ?? "";
      expect(topicSlugs.has(target) || href.split("/").length === 3, `${lesson.slug} links to unknown ${href}`).toBe(true);
    }
  });
});

describe("roles", () => {
  it("loaded", () => expect(Array.isArray(roleFiles)).toBe(true));

  it.each(roleFiles.map((f) => [rel(f), f] as const))("%s is valid", (_name, file) => {
    const data = readJson(file, roleFile);
    for (const role of data.roles) {
      expect(role.category, `${role.slug} category must match file`).toBe(data.category);
      const entry = Object.entries(ROLE_CATALOG).find(([, list]) => list.some(([slug]) => slug === role.slug));
      expect(entry, `${role.slug} is not in role-catalog.ts`).toBeTruthy();
      expect(entry?.[0], `${role.slug} belongs in ${entry?.[0]}`).toBe(role.category);
      for (const stage of [role.roadmap.beginner, role.roadmap.intermediate, role.roadmap.advanced]) {
        for (const topic of stage.topics) expect(topicSlugs.has(topic), `${role.slug} → topic ${topic}`).toBe(true);
      }
      for (const next of role.nextRoles) expect(roleSlugs.has(next), `${role.slug} → next role ${next}`).toBe(true);
      if (role.slug === "penetration-testing-specialist") expect(role.boundaries, "needs boundaries").toBeTruthy();
    }
  });
});

describe("question banks", () => {
  it("loaded", () => expect(Array.isArray(bankFiles)).toBe(true));
  it.each(bankFiles.map((f) => [rel(f), f] as const))("%s is valid", (_name, file) => {
    const bank = readJson(file, questionBankFile);
    for (const q of bank.questions) expect(topicSlugs.has(q.topic), `${q.id} topic ${q.topic}`).toBe(true);
  });
});

describe("interview tracks", () => {
  it("loaded", () => expect(Array.isArray(interviewFiles)).toBe(true));
  it.each(interviewFiles.map((f) => [rel(f), f] as const))("%s is valid", (_name, file) => {
    const track = readJson(file, interviewTrack);
    const ids = track.questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of track.roles) expect(roleSlugs.has(r), `${track.track} → role ${r}`).toBe(true);
  });
});

describe("global uniqueness", () => {
  it("question ids are unique across all banks and lesson quizzes", () => {
    const ids = [
      ...readDir(path.join(CONTENT_DIR, "questions"), ".json").flatMap((f) => {
        try {
          return readJson(f, questionBankFile).questions.map((q) => q.id);
        } catch {
          return [];
        }
      }),
      ...readDir(path.join(CONTENT_DIR, "lessons"), ".md").flatMap((f) => {
        try {
          return parseLessonFile(f).quiz.map((q) => q.id);
        } catch {
          return [];
        }
      }),
    ];
    const dupes = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
    expect(dupes, `duplicate question ids: ${dupes.join(", ")}`).toEqual([]);
  });

  it("interview question ids are unique across tracks", () => {
    const ids = readDir(path.join(CONTENT_DIR, "interviews"), ".json").flatMap((f) => {
      try {
        return readJson(f, interviewTrack).questions.map((q) => q.id);
      } catch {
        return [];
      }
    });
    const dupes = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
    expect(dupes, `duplicate interview ids: ${dupes.join(", ")}`).toEqual([]);
  });
});

describe("projects", () => {
  it("point at existing example folders", () => {
    const file = path.join(CONTENT_DIR, "projects.json");
    if (!fs.existsSync(file)) return;
    for (const p of readJson(file, { parse: (v: unknown) => project.array().parse(v) })) {
      if (p.sourceDir) expect(fs.existsSync(path.join(CONTENT_DIR, "..", "..", p.sourceDir)), p.sourceDir).toBe(true);
    }
  });
});
