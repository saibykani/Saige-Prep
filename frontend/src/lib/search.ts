/** Client-side search over the prebuilt index (shared types + ranking). */

export type SearchKind = "lesson" | "role" | "interview" | "project" | "tool" | "practice" | "section";

export interface SearchDoc {
  id: string;
  kind: SearchKind;
  title: string;
  text: string;
  href: string;
  track?: string;
  level?: "beginner" | "intermediate" | "advanced";
  minutes?: number;
  tags: string[];
}

export const KIND_LABEL: Record<SearchKind, string> = {
  lesson: "Lesson",
  role: "Role",
  interview: "Interview question",
  project: "Project",
  tool: "Tool",
  practice: "Practice",
  section: "Section",
};

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");

export interface SearchFilters {
  kinds?: SearchKind[];
  track?: string;
  level?: string;
  maxMinutes?: number;
}

/**
 * Every query token must appear in the doc. Ranking: title (3) > tags (2) > text (1),
 * with a bonus for title prefix matches. Filters are applied first.
 */
export function searchDocs(docs: SearchDoc[], query: string, filters: SearchFilters = {}, limit = 50): SearchDoc[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  const filtered = docs.filter(
    (d) =>
      (!filters.kinds?.length || filters.kinds.includes(d.kind)) &&
      (!filters.track || d.track === filters.track) &&
      (!filters.level || d.level === filters.level) &&
      (!filters.maxMinutes || (d.minutes ?? 0) <= filters.maxMinutes),
  );
  if (tokens.length === 0) return filtered.slice(0, limit);

  const scored: { doc: SearchDoc; score: number }[] = [];
  for (const doc of filtered) {
    const title = normalize(doc.title);
    const tags = normalize(doc.tags.join(" "));
    const text = normalize(doc.text);
    let score = 0;
    let all = true;
    for (const token of tokens) {
      const s = (title.includes(token) ? 3 : 0) + (tags.includes(token) ? 2 : 0) + (text.includes(token) ? 1 : 0);
      if (s === 0) {
        all = false;
        break;
      }
      score += s;
    }
    if (!all) continue;
    if (title.startsWith(tokens[0])) score += 2;
    if (doc.kind === "lesson" || doc.kind === "role") score += 0.5;
    scored.push({ doc, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title))
    .slice(0, limit)
    .map((s) => s.doc);
}
