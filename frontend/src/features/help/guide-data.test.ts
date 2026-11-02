import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { NAV_GROUPS } from "@/lib/navigation";
import { FAQ, WALKTHROUGHS } from "./guide-data";

const publicDir = path.join(process.cwd(), "public");
const images = WALKTHROUGHS.flatMap((w) => w.steps.flatMap((s) => (s.image ? [s.image] : [])));

describe("help guide data", () => {
  it("has unique walkthrough ids and step titles", () => {
    const ids = WALKTHROUGHS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const w of WALKTHROUGHS) {
      const titles = w.steps.map((s) => s.title);
      expect(new Set(titles).size, w.id).toBe(titles.length);
      expect(w.steps.length, w.id).toBeGreaterThan(0);
    }
    expect(FAQ.length).toBeGreaterThan(0);
  });

  it("keeps each step short (one to three sentences)", () => {
    for (const w of WALKTHROUGHS) {
      for (const s of w.steps) {
        const sentences = s.body.split(/(?<=[.!?])\s+(?=[A-Z“"])/).filter(Boolean);
        expect(sentences.length, `${w.id}: ${s.title}`).toBeLessThanOrEqual(3);
      }
    }
  });

  it("points every screenshot at a file in public/help", () => {
    expect(images.length).toBeGreaterThan(30);
    for (const img of images) {
      expect(img.src.startsWith("/help/"), img.src).toBe(true);
      expect(existsSync(path.join(publicDir, img.src)), `${img.src} is missing: run npm run help:screenshots`).toBe(true);
      expect(img.alt.length, img.src).toBeGreaterThan(5);
    }
  });

  it("uses every captured screenshot", () => {
    const used = new Set(images.map((i) => path.basename(i.src)));
    const unused = readdirSync(path.join(publicDir, "help")).filter((f) => /\.(webp|png)$/.test(f) && !used.has(f));
    expect(unused).toEqual([]);
  });

  it("links only to app routes that exist", () => {
    const appDir = path.join(process.cwd(), "src", "app", "(app)");
    const tracks = new Set(NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href)).filter((h) => h.startsWith("/learn/")));
    const hrefs = [
      ...WALKTHROUGHS.flatMap((w) => [w.start.href, ...w.steps.flatMap((s) => [s.link?.href, s.image?.url])]),
      ...FAQ.map((f) => f.link?.href),
    ].filter((h): h is string => Boolean(h));
    for (const href of hrefs) {
      const [section, track] = href.split("/").slice(1);
      expect(existsSync(path.join(appDir, section, "page.tsx")), href).toBe(true);
      if (section === "learn" && track) expect(tracks.has(`/learn/${track}`), href).toBe(true);
    }
  });
});
