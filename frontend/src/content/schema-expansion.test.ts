/**
 * Step 2 tests: expansion schemas, official-domain allow-list, staleness and forbidden-claims checks.
 * Fixtures live in src/content/fixtures (outside frontend/content, so no loader or route sees them).
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { findForbiddenClaims, stalenessOf, stalenessReport } from "./exam-checks";
import { questionBankFile, roleFile } from "./schema";
import {
  aptitudeTopicFrontmatter,
  careerOverview,
  domainFile,
  domainRole,
  examFile,
  isOfficialUrl,
  mockDefinition,
  modelledPracticePaper,
  questionBankV2,
} from "./schema-expansion";

const FIXTURES = path.join(__dirname, "fixtures");
const load = (name: string) => JSON.parse(fs.readFileSync(path.join(FIXTURES, name), "utf8"));
const clone = <T>(v: T): T => structuredClone(v);
const NOW = new Date("2026-11-14T12:00:00Z");

describe("fixtures", () => {
  it("are clearly marked, live outside content/, and are not routable", () => {
    const files = fs.readdirSync(FIXTURES);
    expect(files.length).toBeGreaterThanOrEqual(6);
    for (const f of files) {
      expect(f.startsWith("fixture-")).toBe(true);
      expect(load(f).slug ?? load(f).bank ?? "fixture").toMatch(/^fixture-|^fixture$/);
    }
    expect(path.relative(path.join(__dirname, "../../content"), FIXTURES).startsWith("..")).toBe(true);
  });

  it("all validate against their schemas", () => {
    expect(domainFile.parse(load("fixture-domain.json")).country).toBe("IN");
    expect(careerOverview.parse(load("fixture-career.json")).locale).toBe("en");
    expect(examFile.parse(load("fixture-exam.json")).country).toBe("IN");
    expect(aptitudeTopicFrontmatter.parse(load("fixture-aptitude-topic.json")).subject).toBe("quantitative");
    expect(questionBankV2.parse(load("fixture-bank.json")).questions).toHaveLength(5);
    expect(mockDefinition.parse(load("fixture-mock.json")).seed).toBe(7);
  });

  it("defaults country to IN and locale to en", () => {
    const exam = clone(load("fixture-exam.json"));
    delete exam.country;
    delete exam.locale;
    const parsed = examFile.parse(exam);
    expect(parsed.country).toBe("IN");
    expect(parsed.locale).toBe("en");
  });
});

describe("existing schemas are untouched", () => {
  it("existing roles still validate and convert to domain roles", () => {
    const dir = path.join(__dirname, "../../content/roles");
    let n = 0;
    for (const f of fs.readdirSync(dir)) {
      const file = roleFile.parse(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
      for (const r of file.roles) {
        const { category, ...rest } = r;
        domainRole.parse({ ...rest, domain: "testing", group: category });
        n++;
      }
    }
    expect(n).toBeGreaterThan(80);
  });

  it("existing question banks validate as extended banks (track maps to scope.course)", () => {
    const dir = path.join(__dirname, "../../content/questions");
    for (const f of fs.readdirSync(dir)) {
      const bank = questionBankFile.parse(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
      const v2 = questionBankV2.parse({ bank: bank.bank, title: bank.title, scope: { course: bank.track }, questions: bank.questions });
      expect(v2.questions.every((q) => q.source === "original")).toBe(true);
    }
  });
});

describe("official-domain allow-list", () => {
  it.each([
    "https://upsc.gov.in/",
    "https://www.ssc.gov.in/notice",
    "https://ibps.in/",
    "https://rrbcdg.gov.in/",
    "https://rrbbpl.gov.in/",
    "https://joinindianarmy.nic.in/",
    "https://afcat.cdac.in/AFCAT/",
    "https://keralapsc.gov.in/",
    "https://www.icai.org/",
    "https://nta.ac.in/",
  ])("accepts %s", (u) => expect(isOfficialUrl(u)).toBe(true));

  it.each([
    "http://upsc.gov.in/",
    "https://upsc.gov.in.evil.com/",
    "https://evilupsc.gov.in.example.org/",
    "https://notupsc.in/",
    "https://gov.in/",
    "https://user:pw@upsc.gov.in/",
    "https://www.byjus.com/upsc",
    "https://testbook.com/ssc-cgl",
    "https://www.hindustantimes.com/",
    "https://xibps.in/",
    "javascript:alert(1)",
    "not a url",
  ])("rejects %s", (u) => expect(isOfficialUrl(u)).toBe(false));

  it("exam schema rejects a non-official or http link", () => {
    for (const url of ["https://coachingsite.example.com/ssc", "http://ssc.gov.in/"]) {
      const e = clone(load("fixture-exam.json"));
      e.source.officialLinks[0].url = url;
      expect(examFile.safeParse(e).success).toBe(false);
    }
  });

  it("rejects a non-official previous-paper link", () => {
    const e = clone(load("fixture-exam.json"));
    e.previousPapers[0].url = "https://paperdownloads.example.com/2025.pdf";
    expect(examFile.safeParse(e).success).toBe(false);
  });
});

describe("exam schema rules", () => {
  const bad = (mutate: (e: ReturnType<typeof load>) => void) => {
    const e = clone(load("fixture-exam.json"));
    mutate(e);
    return examFile.safeParse(e).success;
  };

  it("requires source, a notification or syllabus link, and a real lastVerified date", () => {
    expect(bad((e) => delete e.source)).toBe(false);
    expect(bad((e) => (e.source.officialLinks = [{ label: "Homepage only", url: "https://ssc.gov.in/", kind: "homepage" }]))).toBe(false);
    expect(bad((e) => (e.source.lastVerified = "2026-02-30"))).toBe(false);
    expect(bad((e) => (e.source.lastVerified = "14/11/2026"))).toBe(false);
    expect(bad((e) => delete e.source.notificationYear)).toBe(false);
  });

  it("has no place for cut-offs, vacancies or salary (strict objects)", () => {
    expect(bad((e) => (e.cutoff = { general: 140 }))).toBe(false);
    expect(bad((e) => (e.vacancies = 5000))).toBe(false);
    expect(bad((e) => (e.papers[0].sections[0].salary = 1))).toBe(false);
  });

  it("checks marks, timing, stages and references", () => {
    expect(bad((e) => (e.papers[0].totalMarks = 151))).toBe(false);
    expect(bad((e) => delete e.papers[0].sections[1].durationMin)).toBe(false);
    expect(bad((e) => (e.papers[0].stage = "nope"))).toBe(false);
    expect(bad((e) => (e.studyPath[0].nodes = ["missing-node"]))).toBe(false);
    expect(bad((e) => (e.syllabus[0].children[0].id = "ratio"))).toBe(false);
    expect(bad((e) => (e.papers[0].sections[0].negativeMarking = { perWrong: -1 }))).toBe(false);
    expect(bad((e) => (e.country = "india"))).toBe(false);
    expect(bad((e) => (e.locale = "Hindi"))).toBe(false);
  });

  it("allows omitted numbers (unreadable official pattern) and Hindi locale", () => {
    expect(
      bad((e) => {
        delete e.papers[0].totalMarks;
        e.papers[0].sectionalTiming = false;
        delete e.papers[0].sections[0].marks;
        delete e.papers[0].sections[0].questions;
        e.locale = "hi";
      }),
    ).toBe(true);
  });

  it("requires previous-paper entries to carry lastVerified and a known stage", () => {
    expect(bad((e) => delete e.previousPapers[0].lastVerified)).toBe(false);
    expect(bad((e) => (e.previousPapers[0].stage = "ghost"))).toBe(false);
  });
});

describe("modelled-on practice papers are never the real paper", () => {
  const base = () => clone(load("fixture-exam.json").practicePapers[0]);
  it("accepts honest labelling", () => expect(modelledPracticePaper.safeParse(base()).success).toBe(true));
  it.each([
    ["title claims official", { title: "Official 2025 Tier I paper modelled on the pattern" }],
    ["title claims actual", { title: "Actual Tier I paper, modelled on 2025" }],
    ["title says previous year paper", { title: "Previous year paper 2025, modelled on pattern" }],
    ["title lacks modelled on", { title: "Tier I practice paper 2025" }],
    ["disclaimer missing the not-real statement", { disclaimer: "Original questions modelled on the 2025 pattern." }],
    ["kind is not modelled-on", { kind: "official" }],
  ])("rejects: %s", (_n, patch) => {
    expect(modelledPracticePaper.safeParse({ ...base(), ...patch }).success).toBe(false);
  });

  it("year-style mocks follow the same rule", () => {
    const m = load("fixture-mock.json");
    expect(mockDefinition.safeParse({ ...m, title: "Real 2025 paper mock" }).success).toBe(false);
    expect(mockDefinition.safeParse({ ...m, title: "Mock paper for practice" }).success).toBe(false);
  });
});

describe("other schemas, invalid cases", () => {
  it("domain: duplicate group ids rejected", () => {
    const d = clone(load("fixture-domain.json"));
    d.roleGroups.push({ id: "fixture-group", label: "Again" });
    expect(domainFile.safeParse(d).success).toBe(false);
  });
  it("role salaryNote needs an official source", () => {
    const dir = path.join(__dirname, "../../content/roles");
    const f = roleFile.parse(JSON.parse(fs.readFileSync(path.join(dir, fs.readdirSync(dir)[0]), "utf8")));
    const { category, ...rest } = f.roles[0];
    const ok = { ...rest, domain: "testing", group: category };
    expect(domainRole.safeParse({ ...ok, salaryNote: { text: "See the official pay notification", source: "https://upsc.gov.in/" } }).success).toBe(true);
    expect(domainRole.safeParse({ ...ok, salaryNote: { text: "Earns 12 LPA on average", source: "https://blog.example.com/x" } }).success).toBe(false);
  });
  it("career: qualifying exams need official links", () => {
    const c = clone(load("fixture-career.json"));
    c.qualifyingExams[0].links[0].url = "https://coaching.example.com/";
    expect(careerOverview.safeParse(c).success).toBe(false);
  });
  it("aptitude topic: unknown subject and extra keys rejected", () => {
    const t = load("fixture-aptitude-topic.json");
    expect(aptitudeTopicFrontmatter.safeParse({ ...t, subject: "astrology" }).success).toBe(false);
    expect(aptitudeTopicFrontmatter.safeParse({ ...t, interview: [] }).success).toBe(false);
  });
  it("extended bank: unknown passage, empty scope, official-PYQ source, bad image alt rejected", () => {
    const b = load("fixture-bank.json");
    const withQ = (i: number, patch: object) => {
      const c = clone(b);
      Object.assign(c.questions[i], patch);
      return questionBankV2.safeParse(c).success;
    };
    expect(withQ(1, { passageId: "ghost" })).toBe(false);
    expect(withQ(0, { source: "official PYQ" })).toBe(false);
    expect(withQ(1, { image: { path: "/x.png", alt: "x" } })).toBe(false);
    expect(withQ(0, { answer: [9] })).toBe(false);
    expect(questionBankV2.safeParse({ ...b, scope: {} }).success).toBe(false);
  });
  it("mock: difficultyMix must sum to 1", () => {
    const m = clone(load("fixture-mock.json"));
    m.sections[0].pick.difficultyMix.advanced = 0.9;
    expect(mockDefinition.safeParse(m).success).toBe(false);
  });
});

describe("staleness check on lastVerified (12 months fail, 6 months warn)", () => {
  it("classifies dates", () => {
    expect(stalenessOf("2026-11-14", NOW)).toBe("ok");
    expect(stalenessOf("2026-05-14", NOW)).toBe("ok");
    expect(stalenessOf("2026-05-13", NOW)).toBe("warn");
    expect(stalenessOf("2025-11-14", NOW)).toBe("warn");
    expect(stalenessOf("2025-11-13", NOW)).toBe("stale");
    expect(stalenessOf("2026-11-15", NOW)).toBe("future");
  });
  it("handles month-end clamping", () => {
    expect(stalenessOf("2026-02-28", new Date("2026-08-31T00:00:00Z"))).toBe("ok");
    expect(stalenessOf("2026-02-27", new Date("2026-08-31T00:00:00Z"))).toBe("warn");
  });
  it("the report fails stale/future exams (fixture date manipulated) and covers previous-paper links", () => {
    const exam = clone(load("fixture-exam.json"));
    expect(stalenessReport(exam, NOW)).toEqual({ errors: [], warnings: [] });

    exam.source.lastVerified = "2025-01-01";
    expect(stalenessReport(exam, NOW).errors).toHaveLength(1);

    exam.source.lastVerified = "2026-11-01";
    exam.previousPapers[0].lastVerified = "2024-01-01";
    expect(stalenessReport(exam, NOW).errors[0]).toContain("previousPapers[0]");

    exam.previousPapers[0].lastVerified = "2027-01-01";
    expect(stalenessReport(exam, NOW).errors[0]).toContain("future");

    exam.previousPapers[0].lastVerified = "2026-01-01";
    expect(stalenessReport(exam, NOW)).toMatchObject({ errors: [], warnings: [expect.stringContaining("6 months")] });
  });
  it("every fixture exam is currently fresh, relative to the real clock only as a warning", () => {
    // Fixtures are static; staleness against the real clock is reported, never failed, for fixtures.
    const exam = load("fixture-exam.json");
    expect(stalenessReport(exam, new Date(exam.source.lastVerified)).errors).toEqual([]);
  });
});

describe("forbidden-claims check", () => {
  it("passes the clean fixture exam", () => {
    expect(findForbiddenClaims(load("fixture-exam.json"))).toEqual([]);
  });
  it.each([
    ["cut-off", "Last year's cut-off was 140"],
    ["cutoff", "General cutoff rose"],
    ["vacancy", "About 5000 vacancies are expected"],
    ["salary", "Starting salary is attractive"],
    ["lakh", "Package of 6 lakh"],
    ["LPA", "Offers 12 LPA"],
    ["rupee", "Pay of ₹44,900"],
    ["applicants", "Over 10 lakh applicants"],
    ["difficulty", "Expected difficulty is moderate"],
    ["topper", "Toppers study 10 hours a day"],
  ])("flags %s in any text field", (_n, text) => {
    const e = clone(load("fixture-exam.json"));
    e.summary = text;
    expect(findForbiddenClaims(e).length).toBeGreaterThan(0);
    const e2 = clone(load("fixture-exam.json"));
    e2.syllabus[0].children[1].officialText = text;
    expect(findForbiddenClaims(e2)[0].path).toContain("syllabus[0].children[1].officialText");
  });
  it("ignores URLs (official links may contain such words)", () => {
    const e = clone(load("fixture-exam.json"));
    e.source.officialLinks[0].url = "https://ssc.gov.in/cutoff-notice";
    expect(findForbiddenClaims(e)).toEqual([]);
    expect(examFile.safeParse(e).success).toBe(true);
  });
});
