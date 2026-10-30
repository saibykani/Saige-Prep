/** Shared (server + client) helpers for Markdown content. */

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** `##` headings for an on-page table of contents (code fences are skipped). */
export function headingsOf(source: string) {
  const withoutCode = source.replace(/```[\s\S]*?```/g, "");
  return [...withoutCode.matchAll(/^## (.+)$/gm)].map(([, text]) => ({ id: slugify(text.trim()), text: text.trim() }));
}
