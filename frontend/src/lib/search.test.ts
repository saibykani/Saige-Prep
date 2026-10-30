import { describe, expect, it } from "vitest";
import { searchDocs, type SearchDoc } from "./search";

const docs: SearchDoc[] = [
  { id: "1", kind: "lesson", title: "Boundary Value Analysis", text: "edges of partitions", href: "/a", track: "manual-testing", level: "beginner", minutes: 30, tags: ["test-design"] },
  { id: "2", kind: "lesson", title: "JMeter fundamentals", text: "thread groups and samplers", href: "/b", track: "performance", level: "intermediate", minutes: 40, tags: ["jmeter"] },
  { id: "3", kind: "role", title: "Performance Test Engineer", text: "JMeter, analysis", href: "/c", tags: ["performance"] },
  { id: "4", kind: "tool", title: "Boundary value helper", text: "generate boundary tests", href: "/d", tags: ["bva"] },
];

describe("searchDocs", () => {
  it("requires every token and ranks title matches first", () => {
    expect(searchDocs(docs, "jmeter").map((d) => d.id)).toEqual(["2", "3"]);
    expect(searchDocs(docs, "boundary tests").map((d) => d.id)).toEqual(["4"]);
  });

  it("is case- and accent-insensitive", () => {
    expect(searchDocs(docs, "BOUNDÁRY").map((d) => d.id)).toContain("1");
  });

  it("applies filters", () => {
    expect(searchDocs(docs, "", { kinds: ["role"] }).map((d) => d.id)).toEqual(["3"]);
    expect(searchDocs(docs, "", { track: "performance" }).map((d) => d.id)).toEqual(["2"]);
    expect(searchDocs(docs, "", { level: "beginner" }).map((d) => d.id)).toEqual(["1"]);
    expect(searchDocs(docs, "", { kinds: ["lesson"], maxMinutes: 30 }).map((d) => d.id)).toEqual(["1"]);
  });
});
