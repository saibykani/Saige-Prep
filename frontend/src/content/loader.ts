/**
 * Build-time content loader. Reads Markdown/JSON from frontend/content/ with fs, validates
 * it with the zod schemas, and returns typed data. Server-only: never import from client code.
 */
import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { allTopics, TRACKS } from "./curriculum";
import {
  interviewTrack,
  lessonFrontmatter,
  project,
  questionBankFile,
  roleFile,
  type InterviewTrack,
  type LessonFrontmatter,
  type Project,
  type QuestionBank,
  type Role,
} from "./schema";

export const CONTENT_DIR = path.join(process.cwd(), "content");

export interface Lesson extends LessonFrontmatter {
  track: string;
  module: string;
  body: string;
  /** Estimated from the body, for display. */
  words: number;
}

export function readDir(dir: string, ext: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return readDir(full, ext);
      return entry.name.endsWith(ext) ? [full] : [];
    })
    .sort();
}

export function parseLessonFile(file: string): Lesson {
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const parsed = lessonFrontmatter.safeParse(data);
  if (!parsed.success) {
    throw new Error(`${path.relative(CONTENT_DIR, file)}: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
  }
  const topic = allTopics().find((entry) => entry.slug === parsed.data.slug);
  if (!topic) throw new Error(`${file}: slug "${parsed.data.slug}" is not in curriculum.ts`);
  return {
    ...parsed.data,
    track: topic.track.slug,
    module: topic.module.slug,
    body: content.trim(),
    words: content.split(/\s+/).filter(Boolean).length,
  };
}

let lessonCache: Map<string, Lesson> | null = null;

export function getLessons(): Map<string, Lesson> {
  if (lessonCache) return lessonCache;
  const lessons = new Map<string, Lesson>();
  for (const file of readDir(path.join(CONTENT_DIR, "lessons"), ".md")) {
    const lesson = parseLessonFile(file);
    if (lessons.has(lesson.slug)) throw new Error(`Duplicate lesson slug ${lesson.slug}`);
    lessons.set(lesson.slug, lesson);
  }
  lessonCache = lessons;
  return lessons;
}

export function getLesson(slug: string): Lesson | undefined {
  return getLessons().get(slug);
}

export function readJson<T>(file: string, schema: { parse: (v: unknown) => T }): T {
  try {
    return schema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
  } catch (error) {
    throw new Error(`${path.relative(CONTENT_DIR, file)}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function getRoles(): Role[] {
  return readDir(path.join(CONTENT_DIR, "roles"), ".json").flatMap((file) => readJson(file, roleFile).roles);
}

export function getQuestionBanks(): QuestionBank[] {
  return readDir(path.join(CONTENT_DIR, "questions"), ".json").map((file) => readJson(file, questionBankFile));
}

export function getInterviewTracks(): InterviewTrack[] {
  return readDir(path.join(CONTENT_DIR, "interviews"), ".json").map((file) => readJson(file, interviewTrack));
}

export function getProjects(): Project[] {
  const file = path.join(CONTENT_DIR, "projects.json");
  if (!fs.existsSync(file)) return [];
  return readJson(file, { parse: (v: unknown) => project.array().parse(v) });
}

/** Lightweight per-track summary for catalogue pages (no lesson bodies). */
export function getTrackSummaries() {
  const lessons = getLessons();
  return TRACKS.map((track) => {
    const topics = track.modules.flatMap((m) => m.topics);
    const written = topics.filter((topic) => lessons.has(topic.slug));
    return {
      slug: track.slug,
      title: track.title,
      href: track.href,
      description: track.description,
      modules: track.modules.length,
      topics: topics.length,
      written: written.length,
      minutes: written.reduce((sum, topic) => sum + (lessons.get(topic.slug)?.duration ?? 0), 0),
    };
  });
}
