import { buildSearchIndex } from "@/content/search-index";

/** Static search index, generated at build time from bundled content. */
export function GET() {
  return Response.json(buildSearchIndex());
}
