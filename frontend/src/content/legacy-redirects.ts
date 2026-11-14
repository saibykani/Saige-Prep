/**
 * Permanent redirects from the pre-expansion URLs to the /careers tree. Generated from the
 * content data files at config load, so a new course, bank or interview track is covered with
 * no hand edit. Imported by next.config.ts (plain fs + JSON, no app aliases).
 * Index pages (/learn, /roadmaps, /mock-tests, /interviews) are NOT redirected: they stay as
 * all-content browse views (plan section 3.6).
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { courseHref, interviewDomain, interviewHref, mockTestHref, ROLE_DOMAIN, roleHref } from "./routes";

export type LegacyRedirect = { source: string; destination: string; permanent: true };

function readJsonDir(dir: string): Record<string, unknown>[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(readFileSync(path.join(dir, f), "utf8")) as Record<string, unknown>);
}

export function legacyRedirects(contentDir = path.join(process.cwd(), "content")): LegacyRedirect[] {
  const courseDomain = new Map<string, string>();
  for (const d of readJsonDir(path.join(contentDir, "domains"))) {
    for (const c of d.courses as { slug: string }[]) courseDomain.set(c.slug, d.slug as string);
  }
  const domainOf = (course: string) => courseDomain.get(course);
  const out: LegacyRedirect[] = [];
  const add = (source: string, destination: string) => out.push({ source, destination, permanent: true });

  for (const [course, domain] of courseDomain) {
    add(`/learn/${course}`, courseHref(domain, course));
    add(`/learn/${course}/:lesson`, `${courseHref(domain, course)}/:lesson`);
  }
  for (const bank of readJsonDir(path.join(contentDir, "questions"))) {
    const slug = bank.bank as string;
    add(`/mock-tests/${slug}`, mockTestHref(domainOf(bank.track as string) ?? ROLE_DOMAIN, slug));
  }
  for (const t of readJsonDir(path.join(contentDir, "interviews"))) {
    const slug = t.track as string;
    add(`/interviews/${slug}`, interviewHref(interviewDomain(slug, domainOf), slug));
  }
  add("/roadmaps/:role", roleHref(":role"));
  return out;
}
