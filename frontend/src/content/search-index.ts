import "server-only";
import { NAV_ITEMS } from "@/lib/navigation";
import { PRACTICE, TOOLS } from "@/lib/registry";
import type { SearchDoc } from "@/lib/search";
import { allTopics } from "./curriculum";
import { getInterviewTracks, getLessons, getProjects, getRoles } from "./loader";

/**
 * Kinds whose pages are live. Interview and project docs are indexed only
 * once their pages ship, so search never links to an unbuilt page.
 */
const LIVE_KINDS = new Set<SearchDoc["kind"]>(["lesson", "role", "section", "tool", "practice"]);

/** Builds the global search index from all bundled content (run at build time). */
export function buildSearchIndex(): SearchDoc[] {
  return buildAllDocs().filter((doc) => LIVE_KINDS.has(doc.kind));
}

function buildAllDocs(): SearchDoc[] {
  const lessons = getLessons();
  const docs: SearchDoc[] = [];

  for (const topic of allTopics()) {
    const lesson = lessons.get(topic.slug);
    if (!lesson) continue;
    docs.push({
      id: `lesson:${lesson.slug}`,
      kind: "lesson",
      title: lesson.title,
      text: `${lesson.summary} ${lesson.objectives.join(" ")}`,
      href: `${topic.track.href}/${lesson.slug}`,
      track: topic.track.slug,
      level: lesson.level,
      minutes: lesson.duration,
      tags: lesson.tags,
    });
  }

  for (const role of getRoles()) {
    docs.push({
      id: `role:${role.slug}`,
      kind: "role",
      title: role.title,
      text: `${role.overview} ${role.skills.essential.join(" ")} ${role.tools.join(" ")}`,
      href: `/roadmaps/${role.slug}`,
      tags: [role.category],
    });
  }

  for (const track of getInterviewTracks()) {
    for (const q of track.questions) {
      docs.push({
        id: `interview:${q.id}`,
        kind: "interview",
        title: q.question,
        text: q.keyPoints.join(" "),
        href: `/interviews?track=${track.track}`,
        level: q.difficulty,
        minutes: q.minutes,
        tags: [track.track, q.kind],
      });
    }
  }

  for (const project of getProjects()) {
    docs.push({
      id: `project:${project.slug}`,
      kind: "project",
      title: project.title,
      text: `${project.summary} ${project.skills.join(" ")}`,
      href: `/projects/${project.slug}`,
      level: project.level,
      minutes: project.hours * 60,
      tags: project.skills.slice(0, 4).map((s) => s.toLowerCase()),
    });
  }

  for (const tool of TOOLS) {
    docs.push({ id: `tool:${tool.slug}`, kind: "tool", title: tool.title, text: tool.description, href: `/toolkit/${tool.slug}`, tags: tool.keywords });
  }

  for (const p of PRACTICE) {
    docs.push({ id: `practice:${p.slug}`, kind: "practice", title: p.title, text: p.description, href: `/practice/${p.slug}`, tags: p.keywords });
  }

  for (const item of NAV_ITEMS.filter((i) => !i.adminOnly)) {
    docs.push({ id: `section:${item.href}`, kind: "section", title: item.label, text: item.description, href: item.href, tags: item.keywords ?? [] });
  }

  return docs;
}
