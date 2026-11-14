// Freezes the public page URLs of the last production build into src/content/legacy-urls.json.
// Run `npm run build` first, then `npm run freeze:urls`.
// Freeze semantics: URLs already in the file are never dropped (a removed route must be fixed with a
// redirect, not by editing the fixture). Pass --check to verify without writing.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, ".next", "prerender-manifest.json");
const fixturePath = join(root, "src", "content", "legacy-urls.json");
const check = process.argv.includes("--check");

if (!existsSync(manifestPath)) {
  console.error("No .next/prerender-manifest.json. Run `npm run build` first.");
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
// Pages only: skip Next internals (/_not-found, /_global-error) and non-page assets (icon.svg, *.json).
const built = Object.entries(manifest.routes)
  .filter(([route, info]) => info.routeType === "page" && !route.startsWith("/_") && !/\.[a-z0-9]+$/i.test(route))
  .map(([route]) => (route === "" ? "/" : route));

const previous = existsSync(fixturePath) ? JSON.parse(readFileSync(fixturePath, "utf8")).urls : [];
const urls = [...new Set([...previous, ...built])].sort();
const added = urls.filter((u) => !previous.includes(u));
const missingFromBuild = previous.filter((u) => !built.includes(u));

if (missingFromBuild.length) {
  console.warn(`${missingFromBuild.length} frozen URL(s) are not in this build (kept in the fixture):`);
  missingFromBuild.slice(0, 20).forEach((u) => console.warn(`  ${u}`));
}
if (check) {
  console.log(`${added.length} new URL(s) not yet frozen; ${urls.length} total.`);
  process.exit(added.length || missingFromBuild.length ? 1 : 0);
}
const out = {
  note: "Frozen public page URLs. Every entry must keep resolving (page or permanent redirect). Regenerate with `npm run freeze:urls` after `npm run build`; entries are only ever added.",
  count: urls.length,
  urls,
};
writeFileSync(fixturePath, JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${urls.length} URLs (${added.length} added) to src/content/legacy-urls.json`);
