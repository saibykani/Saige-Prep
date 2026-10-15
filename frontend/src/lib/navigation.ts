import {
  Bookmark,
  Bot,
  CalendarDays,
  ChartLine,
  ClipboardCheck,
  CodeXml,
  FlaskConical,
  FolderGit2,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Map,
  MessagesSquare,
  NotebookPen,
  Settings,
  ShieldCheck,
  ShieldUser,
  Smartphone,
  Timer,
  Webhook,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
  /** Implementation phase that delivers this section (see docs/implementation-status.md). */
  phase: number;
  /** What the section will contain; shown on its page until the phase lands. */
  planned: string[];
  adminOnly?: boolean;
  keywords?: string[];
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

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
  {
    id: "learn",
    label: "Learn",
    items: [
      {
        href: "/learn",
        label: "Learning Center",
        icon: GraduationCap,
        description: "Every course, module and lesson in one place.",
        phase: 2,
        planned: ["Course catalogue with filters", "Lesson reader with diagrams and code", "Lesson progress tracking"],
        keywords: ["courses", "lessons", "curriculum"],
      },
      {
        href: "/roadmaps",
        label: "Role Roadmaps",
        icon: Map,
        description: "Beginner-to-advanced paths for 70+ testing roles.",
        phase: 2,
        planned: [
          "Core QA, automation, API, performance, mobile, security, data/AI and leadership roles",
          "Essential vs. role-specific vs. optional skills",
          "Readiness criteria and next career steps",
        ],
        keywords: ["career", "role", "path", "sdet", "qa lead"],
      },
      {
        href: "/learn/manual-testing",
        label: "Manual Testing",
        icon: ClipboardCheck,
        description: "Fundamentals, test design, documentation, defects and Agile.",
        phase: 2,
        planned: [
          "Fundamentals, test types and levels",
          "Test design techniques with worked BVA, decision-table and state-transition examples",
          "Test documentation templates and defect management",
          "Real-world scenarios: login, checkout, payments, uploads and more",
        ],
        keywords: ["bva", "equivalence", "test case", "defect", "stlc"],
      },
      {
        href: "/learn/automation",
        label: "Automation Testing",
        icon: Bot,
        description: "Java, Selenium, TestNG, Playwright, Cypress and framework design.",
        phase: 2,
        planned: ["Java for testers", "Selenium WebDriver + TestNG core path", "Playwright, Cypress, WebdriverIO options"],
        keywords: ["selenium", "playwright", "cypress", "testng", "java"],
      },
      {
        href: "/learn/api-testing",
        label: "API Testing",
        icon: Webhook,
        description: "HTTP, REST, Postman, Newman, RestAssured and contract testing.",
        phase: 2,
        planned: ["HTTP and REST fundamentals", "Postman and Newman", "RestAssured automation", "Local mock API"],
        keywords: ["rest", "postman", "restassured", "http", "json"],
      },
      {
        href: "/learn/performance",
        label: "Performance Testing",
        icon: Gauge,
        description: "Workload models, percentiles, JMeter and results analysis.",
        phase: 2,
        planned: ["Load, stress, spike and endurance testing", "Little's Law and percentiles", "JMeter deep dive"],
        keywords: ["jmeter", "load", "p95", "throughput", "latency"],
      },
      {
        href: "/learn/mobile",
        label: "Mobile Testing",
        icon: Smartphone,
        description: "Android, iOS, device coverage and Appium.",
        phase: 2,
        planned: ["Mobile testing fundamentals", "Appium with Java", "Device and OS coverage strategy"],
        keywords: ["appium", "android", "ios"],
      },
      {
        href: "/learn/specialist",
        label: "Specialist Testing",
        icon: ShieldCheck,
        description: "Security, accessibility, data, cloud, localization and AI testing.",
        phase: 2,
        planned: ["Security and accessibility testing", "ETL and data warehouse testing", "LLM and RAG evaluation"],
        keywords: ["security", "accessibility", "a11y", "etl", "llm", "rag"],
      },
      {
        href: "/learn/sdet",
        label: "SDET Engineering",
        icon: CodeXml,
        description: "Framework architecture, CI/CD, test infrastructure and system design.",
        phase: 2,
        planned: ["Framework architecture and design patterns", "CI/CD pipelines", "Test system design"],
        keywords: ["framework", "ci", "cd", "architecture"],
      },
    ],
  },
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
        description: "Timed assessments with server-side scoring.",
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
        href: "/settings",
        label: "Settings",
        icon: Settings,
        description: "Account, system status and data controls.",
        phase: 1,
        planned: ["Data export and account deletion (Phase 8)"],
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

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

export function findNavItem(href: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => item.href === href);
}

/** The nav item whose href is the longest prefix of the pathname. */
export function activeNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
}

export function searchNav(query: string, isAdmin: boolean): NavItem[] {
  const q = query.trim().toLowerCase();
  const visible = NAV_ITEMS.filter((item) => isAdmin || !item.adminOnly);
  if (!q) return visible;
  return visible.filter((item) =>
    [item.label, item.description, ...(item.keywords ?? [])].some((text) => text.toLowerCase().includes(q)),
  );
}
