/**
 * Canonical URL builders for the career-area route tree (docs/expansion-plan.md, step 4).
 * Pure strings only, so server pages, client components and next.config.ts can all import it.
 * Slugs never change; only the prefix moved from /learn, /roadmaps, /mock-tests, /interviews.
 */

/** All roles in the catalogue are testing roles today (see domainOfRole in curriculum.ts). */
export const ROLE_DOMAIN = "testing";

export const careersHref = (domain: string) => `/careers/${domain}`;
export const courseHref = (domain: string, course: string) => `/careers/${domain}/${course}`;
export const lessonHref = (domain: string, course: string, lesson: string) => `/careers/${domain}/${course}/${lesson}`;
export const roleHref = (role: string, domain: string = ROLE_DOMAIN) => `/careers/${domain}/roles/${role}`;
export const mockTestHref = (domain: string, bank: string) => `/careers/${domain}/mock-tests/${bank}`;
export const interviewHref = (domain: string, track: string) => `/careers/${domain}/interviews/${track}`;

/**
 * Domain of an interview track. A track named "<course>-interview" belongs to that course's
 * domain; every other track is a testing track.
 */
export function interviewDomain(track: string, domainOfCourse: (course: string) => string | undefined): string {
  return domainOfCourse(track.replace(/-interview$/, "")) ?? ROLE_DOMAIN;
}
