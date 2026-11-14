import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { allDomains, allTopics, domainOfRole, TRACKS } from "./curriculum";
import { ROLE_CATEGORIES } from "./schema";
import { domainFile } from "./schema-expansion";

const domainsDir = path.join(process.cwd(), "content", "domains");
const files = fs.readdirSync(domainsDir).filter((f) => f.endsWith(".json"));

describe("domain data files", () => {
  it.each(files)("%s validates against the domain schema and matches its file name", (file) => {
    const data = domainFile.parse(JSON.parse(fs.readFileSync(path.join(domainsDir, file), "utf8")));
    expect(data.slug + ".json").toBe(file);
  });

  it("every file is loaded and course slugs are unique across domains", () => {
    expect(allDomains().map((d) => d.slug).sort()).toEqual(files.map((f) => f.replace(".json", "")).sort());
    const slugs = TRACKS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("keeps the legacy track shape: 9 tracks, 230 topics, legacy order, /learn hrefs", () => {
    expect(TRACKS.map((t) => t.slug)).toEqual([
      "manual-testing", "automation", "api-testing", "performance", "jmeter",
      "mobile", "ai-engineering", "specialist", "sdet",
    ]);
    expect(allTopics()).toHaveLength(230);
    for (const t of TRACKS) expect(t.href).toBe(`/careers/${t.domain}/${t.slug}`);
    expect(TRACKS.find((t) => t.slug === "jmeter")?.parent).toBe("performance");
  });

  it("role categories are the testing domain's role groups", () => {
    const testing = allDomains().find((d) => d.slug === "testing")!;
    expect(ROLE_CATEGORIES.map((c) => c.id)).toEqual(testing.roleGroups.map((g) => g.id));
    expect(domainOfRole("automation")).toEqual({ domain: "testing", group: "automation" });
  });
});
