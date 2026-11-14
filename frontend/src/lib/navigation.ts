import {
  Brain,
  Bookmark,
  Bot,
  Briefcase,
  CalendarDays,
  ChartLine,
  ClipboardCheck,
  CodeXml,
  Compass,
  FlaskConical,
  FolderGit2,
  Gauge,
  LifeBuoy,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  Map as MapIcon,
  MessagesSquare,
  NotebookPen,
  Calculator,
  Settings,
  ShieldCheck,
  ShieldUser,
  Smartphone,
  Timer,
  Webhook,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { allDomains, allTopics, findTrack } from "@/content/curriculum";
import { ROLE_CATALOG } from "@/content/role-catalog";
import { careersHref, courseHref } from "@/content/routes";

/**
 * The single definition of navigation (docs/expansion-plan.md, step 5). The sidebar, mobile
 * drawer, command-palette fallback, search "section" entries, breadcrumbs and PlannedSection all
 * read from here.
 *
 * Shape: four areas -> (IT) domains generated from content/domains/*.json, plus a small static
 * list of cross-cutting tools. Courses are not sidebar items; they stay reachable through search
 * and breadcrumbs (`hidden`).
 */

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
  /** "planned": routed but nothing is built yet; its page is a PlannedSection. Default "live". */
  status?: "live" | "planned";
  /** Implementation phase that delivers a legacy planned section (docs/implementation-status.md). */
  phase?: number;
  /** What a planned section will contain; shown on its page until it is built. */
  planned?: string[];
  /** Replaces "Phase N" in the planned banner (expansion steps are not implementation phases). */
  schedule?: string;
  adminOnly?: boolean;
  keywords?: string[];
  /** Sidebar children (the second level). */
  children?: NavItem[];
  /** href of the parent item; set for every non-top-level item. */
  parent?: string;
  /** Searchable and used by breadcrumbs, but not listed in the sidebar. */
  hidden?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/* ------------------------------ Domain-generated items ------------------------------ */

const DOMAIN_ICON: Record<string, LucideIcon> = {
  testing: ClipboardCheck,
  "ai-engineering": Brain,
};

const COURSE_ICON: Record<string, LucideIcon> = {
  "manual-testing": ClipboardCheck,
  automation: Bot,
  "api-testing": Webhook,
  performance: Gauge,
  jmeter: Zap,
  mobile: Smartphone,
  "ai-engineering": Brain,
  specialist: ShieldCheck,
  sdet: CodeXml,
};

/** Search keywords per course (not stored in the domain data files). */
const COURSE_KEYWORDS: Record<string, string[]> = {
  "manual-testing": ["bva", "equivalence", "test case", "defect", "stlc"],
  automation: ["selenium", "playwright", "cypress", "testng", "java"],
  "api-testing": ["rest", "postman", "restassured", "http", "json"],
  performance: ["jmeter", "load", "p95", "throughput", "latency"],
  jmeter: ["jmeter", "load test", "thread group", "correlation", "listener"],
  mobile: ["appium", "android", "ios"],
  "ai-engineering": ["ai", "llm", "rag", "agents", "machine learning", "evals", "ai testing"],
  specialist: ["security", "accessibility", "a11y", "etl", "llm", "rag"],
  sdet: ["framework", "ci", "cd", "architecture"],
};

const IT_DOMAINS = allDomains().filter((d) => d.kind === "it");

const domainItems: NavItem[] = IT_DOMAINS.map((d) => ({
  href: careersHref(d.slug),
  label: d.title,
  icon: DOMAIN_ICON[d.slug] ?? Briefcase,
  description: d.summary,
  keywords: [d.slug],
  parent: "/careers",
}));

/** Courses of every IT domain: searchable and shown in breadcrumbs, not in the sidebar. */
const courseItems: NavItem[] = IT_DOMAINS.flatMap((d) =>
  d.courses.map((c) => ({
    href: courseHref(d.slug, c.slug),
    label: c.title,
    icon: COURSE_ICON[c.slug] ?? GraduationCap,
    description: c.description,
    keywords: COURSE_KEYWORDS[c.slug] ?? [],
    parent: careersHref(d.slug),
    hidden: true,
  })),
);

/* ------------------------------------- Areas ---------------------------------------- */

const careersArea: NavItem = {
  href: "/careers",
  label: "Careers (IT)",
  icon: Briefcase,
  description: "IT career domains: roles, courses, practice and interview preparation.",
  keywords: ["careers", "it", "domains", "software", "jobs"],
  children: [
    ...domainItems,
    {
      href: "/learn",
      label: "Learning Center",
      icon: GraduationCap,
      description: "Every course, module and lesson in one place.",
      keywords: ["courses", "lessons", "curriculum"],
      parent: "/careers",
    },
    {
      href: "/roadmaps",
      label: "Role Roadmaps",
      icon: MapIcon,
      description: "Beginner-to-advanced paths for 70+ testing roles.",
      keywords: ["career", "role", "path", "sdet", "qa lead"],
      parent: "/careers",
    },
  ],
};

const examsArea: NavItem = {
  href: "/exams",
  label: "Government Exams",
  icon: Landmark,
  description: "Exam families, syllabus, pattern, study path and mock tests for Indian government recruitment exams.",
  status: "planned",
  schedule: "expansion steps 10 and 14-15",
  planned: [
    "Exam pages with pattern, eligibility and syllabus quoted from the official notification",
    "Official links with a last-verified date on every page",
    "Study paths and sectional mock tests from original practice questions",
    "A previous papers index linking to the conducting body's own site",
  ],
  keywords: ["upsc", "ssc", "ibps", "railway", "government", "exam"],
};

const aptitudeArea: NavItem = {
  href: "/aptitude",
  label: "Aptitude",
  icon: Calculator,
  description: "Quantitative, reasoning, verbal and data interpretation practice with shortcut methods.",
  status: "planned",
  schedule: "expansion steps 12-13",
  planned: [
    "Subject and topic pages: concept, method, worked examples and common traps",
    "Timed and untimed topic drills with method explanations",
    "Questions with numeric answers recomputed by script",
  ],
  keywords: ["quant", "reasoning", "verbal", "data interpretation", "aptitude"],
};

const nonItArea: NavItem = {
  href: "/careers/non-it",
  label: "India Careers (Non-IT)",
  icon: Compass,
  description: "Overview pages for careers outside IT: finance, law, medicine, engineering, management and more.",
  status: "planned",
  schedule: "expansion step 23a",
  planned: [
    "Role overviews with eligibility and the qualifying exams, each with official links",
    "A study route per career, labelled as an overview rather than a full course",
  ],
  keywords: ["law", "ca", "medicine", "commerce", "management", "non-it", "india"],
};

/** The four areas, in sidebar order. */
export const NAV_AREAS: NavItem[] = [careersArea, examsArea, aptitudeArea, nonItArea];

/* --------------------------------- Cross-cutting tools ------------------------------- */

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Your next actions, recent activity and system status.",
        phase: 1,
        planned: ["Recently viewed lessons", "Quiz and interview history", "Recommended next activities"],
      },
    ],
  },
  { id: "areas", label: "Areas", items: NAV_AREAS },
  {
    id: "practice",
    label: "Practice & Assess",
    items: [
      {
        href: "/practice",
        label: "Practice Lab",
        icon: FlaskConical,
        description: "Manual, Java, API, SQL and performance exercises.",
        phase: 3,
        planned: ["Test design exercises", "API request builder", "Safe SQL sandbox", "Debugging challenges"],
        keywords: ["exercise", "sql", "lab"],
      },
      {
        href: "/mock-tests",
        label: "Mock Tests",
        icon: Timer,
        description: "Timed assessments with topic-wise results.",
        phase: 4,
        planned: ["Timed exams with autosave", "Flag for review", "Topic-wise results and revision"],
        keywords: ["quiz", "exam", "assessment"],
      },
      {
        href: "/interviews",
        label: "Interview Prep",
        icon: MessagesSquare,
        description: "Role-specific mock interviews with transparent rubrics.",
        phase: 5,
        planned: ["15, 30 and 60-minute interviews", "Follow-up questions and model answers", "Rubric self-evaluation"],
        keywords: ["interview", "behavioral", "questions"],
      },
      {
        href: "/projects",
        label: "Real-World Projects",
        icon: FolderGit2,
        description: "Guided portfolio projects with runnable source.",
        phase: 6,
        planned: ["Selenium, RestAssured, Appium frameworks", "JMeter suite", "CI pipeline", "AI evaluation project"],
        keywords: ["portfolio", "project"],
      },
      {
        href: "/toolkit",
        label: "QA Toolkit",
        icon: Wrench,
        description: "Formatters, converters, references and templates.",
        phase: 3,
        planned: ["JSON/XML formatter and diff", "Regex tester", "BVA and EP helpers", "Templates"],
        keywords: ["json", "regex", "base64", "template"],
      },
    ],
  },
  {
    id: "track",
    label: "Track",
    items: [
      {
        href: "/planner",
        label: "Study Planner",
        icon: CalendarDays,
        description: "Plan study tasks around your target role.",
        phase: 7,
        planned: ["Role-based study plan", "Tasks and revision schedule"],
        keywords: ["plan", "schedule"],
      },
      {
        href: "/progress",
        label: "Progress & Analytics",
        icon: ChartLine,
        description: "Real activity-based progress and strengths.",
        phase: 7,
        planned: ["Completion by track", "Accuracy trends", "Transparent readiness indicators"],
        keywords: ["analytics", "stats"],
      },
      {
        href: "/bookmarks",
        label: "Bookmarks",
        icon: Bookmark,
        description: "Saved lessons, questions and resources.",
        phase: 2,
        planned: ["Bookmark lessons, questions and projects", "Revision list"],
      },
      {
        href: "/notes",
        label: "Notes",
        icon: NotebookPen,
        description: "Personal notes linked to lessons.",
        phase: 2,
        planned: ["Markdown notes", "Link notes to lessons"],
      },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      {
        href: "/help",
        label: "Help & User Guide",
        icon: LifeBuoy,
        description: "How to use Saige-Prep and how to study with it.",
        phase: 9,
        planned: [],
        keywords: ["help", "guide", "manual", "how to", "faq", "study"],
      },
      {
        href: "/settings",
        label: "Settings",
        icon: Settings,
        description: "Account, system status and data controls.",
        phase: 1,
        planned: [],
      },
      {
        href: "/admin",
        label: "Admin",
        icon: ShieldUser,
        description: "Content management for the owner account.",
        phase: 6,
        planned: ["Course, lesson and question editing", "Publish workflow", "Media uploads"],
        adminOnly: true,
      },
    ],
  },
];

/* --------------------------------------- Lookups ------------------------------------- */

function walk(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => [item, ...walk(item.children ?? [])]);
}

/** Every navigable entry: areas, domains, tools and the hidden course entries. Hrefs are unique. */
export const NAV_ITEMS: NavItem[] = [...walk(NAV_GROUPS.flatMap((g) => g.items)), ...courseItems];

const BY_HREF = new Map(NAV_ITEMS.map((item) => [item.href, item]));

export function findNavItem(href: string): NavItem | undefined {
  return BY_HREF.get(href);
}

/** The nav item whose href is the longest prefix of the pathname. */
export function activeNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
}

/** hrefs of the active item and all its ancestors (course -> domain -> area). */
export function activeChain(pathname: string): Set<string> {
  const chain = new Set<string>();
  let item = activeNavItem(pathname);
  while (item && !chain.has(item.href)) {
    chain.add(item.href);
    item = item.parent ? BY_HREF.get(item.parent) : undefined;
  }
  return chain;
}

export function searchNav(query: string, isAdmin: boolean): NavItem[] {
  const q = query.trim().toLowerCase();
  const visible = NAV_ITEMS.filter((item) => isAdmin || !item.adminOnly);
  if (!q) return visible;
  return visible.filter((item) =>
    [item.label, item.description, ...(item.keywords ?? [])].some((text) => text.toLowerCase().includes(q)),
  );
}

/* ------------------------------------- Breadcrumbs ----------------------------------- */

export interface Crumb {
  href: string;
  label: string;
}

/** Acronyms that appear in URL slugs and should keep their capitals in labels. */
const ACRONYMS: Record<string, string> = {
  ...Object.fromEntries(
    ["ai", "ml", "llm", "llms", "rag", "api", "apis", "sql", "ui", "ux", "qa", "ci", "cd", "etl", "http", "rest", "json", "xml", "jwt", "sdet", "bdd", "tdd", "iot", "erp", "wcag", "owasp", "aws", "nist", "eu", "pom"].map((w) => [w, w.toUpperCase()]),
  ),
  ios: "iOS",
  mlops: "MLOps",
};

export function titleCase(segment: string) {
  return segment
    .split("-")
    .map((w) => ACRONYMS[w] ?? w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const ROLE_TITLES = new Map<string, string>(Object.values(ROLE_CATALOG).flatMap((roles) => roles.map(([slug, title]) => [slug, title] as const)));

let lessonTitles: Map<string, string> | undefined;
function lessonTitle(course: string, lesson: string): string | undefined {
  lessonTitles ??= new Map(allTopics().map((t) => [`${t.track.slug}/${t.slug}`, t.title]));
  return lessonTitles.get(`${course}/${lesson}`);
}

/**
 * Under /careers/<domain>/, these segments have no page of their own. Their index pages are the
 * all-content views, so the crumb links straight there instead of through a redirect.
 */
const SCOPED_INDEX: Record<string, Crumb> = {
  roles: { href: "/roadmaps", label: "Roles" },
  "mock-tests": { href: "/mock-tests", label: "Mock Tests" },
  interviews: { href: "/interviews", label: "Interview Prep" },
};

export function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean).map(decodeURIComponent);
  return segments.map((segment, i) => {
    const href = `/${segments.slice(0, i + 1).join("/")}`;
    const known = findNavItem(href);
    if (known) return { href, label: known.label };

    if (segments[0] === "careers" && i >= 2) {
      const [, , second, third] = segments;
      if (i === 2 && SCOPED_INDEX[segment]) return SCOPED_INDEX[segment];
      if (i === 3 && second === "roles") return { href, label: ROLE_TITLES.get(third) ?? titleCase(third) };
      if (i === 3 && second && !SCOPED_INDEX[second] && findTrack(second)) {
        return { href, label: lessonTitle(second, third) ?? titleCase(third) };
      }
    }
    return { href, label: titleCase(segment) };
  });
}
