/**
 * Curriculum map: tracks → modules → topics, loaded from content/domains/*.json (a track is a
 * domain course). Each topic slug corresponds to an optional
 * lesson file at content/lessons/<track>/<slug>.md. Topics without a file are shown
 * honestly as "not written yet" rather than with placeholder text.
 */

import { courseHref, interviewDomain } from "./routes";
import { domainFile, type DomainFile } from "./schema-expansion";
import testingRaw from "../../content/domains/testing.json";
import aiEngineeringRaw from "../../content/domains/ai-engineering.json";

export interface Topic {
  slug: string;
  title: string;
}

export interface Module {
  slug: string;
  title: string;
  description: string;
  /** Core path (needed by most roles in this track) vs optional specialisation. */
  path: "core" | "optional";
  topics: Topic[];
}

export interface Track {
  slug: string;
  title: string;
  /** Canonical route of the course page: /careers/<domain>/<course> (matches src/lib/navigation.ts). */
  href: string;
  description: string;
  /** Sub-track shown as a tab inside its parent track (e.g. JMeter inside Performance). */
  parent?: string;
  /** Slug of the domain this course belongs to. */
  domain: string;
  modules: Module[];
}

/** Domain data files (content/domains/*.json), validated at module load. */
const DOMAINS: DomainFile[] = [testingRaw, aiEngineeringRaw].map((raw) => domainFile.parse(raw));

export function allDomains(): DomainFile[] {
  return DOMAINS;
}

export function findDomain(slug: string) {
  return DOMAINS.find((d) => d.slug === slug);
}

/**
 * Compatibility layer: every domain course is exposed as a legacy Track so pages and URLs stay
 * identical. The display order is the legacy one (ai-engineering sat between mobile and
 * specialist); courses not listed here follow in domain order.
 */
const LEGACY_TRACK_ORDER = [
  "manual-testing",
  "automation",
  "api-testing",
  "performance",
  "jmeter",
  "mobile",
  "ai-engineering",
  "specialist",
  "sdet",
];

const courseTracks: Track[] = DOMAINS.flatMap((domain) =>
  domain.courses.map((course) => ({
    slug: course.slug,
    title: course.title,
    href: courseHref(domain.slug, course.slug),
    description: course.description,
    ...(course.parent ? { parent: course.parent } : {}),
    domain: domain.slug,
    modules: course.modules.map((m) => ({
      slug: m.slug,
      title: m.title,
      description: m.description ?? "",
      path: m.path,
      topics: m.topics,
    })),
  })),
);

const rank = (slug: string) => {
  const i = LEGACY_TRACK_ORDER.indexOf(slug);
  return i === -1 ? LEGACY_TRACK_ORDER.length : i;
};

export const TRACKS: Track[] = [...courseTracks].sort((a, b) => rank(a.slug) - rank(b.slug));

/** Domain and role group of a role file category (testing roles live in the testing domain). */
export function domainOfRole(category: string) {
  return { domain: "testing", group: category };
}

export function allTopics() {
  return TRACKS.flatMap((track) =>
    track.modules.flatMap((module) => module.topics.map((topic) => ({ ...topic, track, module }))),
  );
}

/** Domain slug of a course (track), if it exists. */
export function domainOfCourse(course: string) {
  return findTrack(course)?.domain;
}

/** Domain slug of an interview track. */
export function domainOfInterviewTrack(track: string) {
  return interviewDomain(track, domainOfCourse);
}

export function findTrack(slug: string) {
  return TRACKS.find((track) => track.slug === slug);
}
