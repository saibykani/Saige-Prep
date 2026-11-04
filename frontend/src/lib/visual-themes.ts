/**
 * Decorative colour themes for course-card thumbnails and hub heroes. Purely visual:
 * no content lives here. Thumbnails are generated in CSS (gradient + pattern + icon),
 * so nothing is downloaded.
 */
import {
  Activity,
  Bot,
  Brain,
  Bug,
  ClipboardCheck,
  Code,
  FolderGit2,
  Gauge,
  MessagesSquare,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  Webhook,
  type LucideIcon,
} from "lucide-react";

export type Pattern = "dots" | "grid" | "diagonal" | "waves";

export interface VisualTheme {
  /** Gradient stops (all dark enough for white text/icons at AA). */
  from: string;
  via: string;
  to: string;
  pattern: Pattern;
}

export const PALETTE: Record<string, VisualTheme> = {
  violet: { from: "#4c1d95", via: "#6d28d9", to: "#9333ea", pattern: "dots" },
  emerald: { from: "#064e3b", via: "#047857", to: "#0f766e", pattern: "grid" },
  sunset: { from: "#9a3412", via: "#c2410c", to: "#be185d", pattern: "diagonal" },
  indigo: { from: "#312e81", via: "#4338ca", to: "#0f766e", pattern: "waves" },
  rose: { from: "#881337", via: "#be123c", to: "#7e22ce", pattern: "dots" },
  amber: { from: "#78350f", via: "#a16207", to: "#c2410c", pattern: "grid" },
  teal: { from: "#134e4a", via: "#0f766e", to: "#4338ca", pattern: "diagonal" },
  plum: { from: "#3b0764", via: "#86198f", to: "#be185d", pattern: "waves" },
};

export type Tone = keyof typeof PALETTE;
const TONES = Object.keys(PALETTE) as Tone[];

/** Fixed look per known track / bank / interview slug; anything else is hashed (deterministic). */
const KNOWN: Record<string, { tone: Tone; icon: LucideIcon }> = {
  "manual-testing": { tone: "violet", icon: ClipboardCheck },
  "manual-qa": { tone: "violet", icon: ClipboardCheck },
  automation: { tone: "indigo", icon: Bot },
  "api-testing": { tone: "emerald", icon: Webhook },
  performance: { tone: "sunset", icon: Gauge },
  jmeter: { tone: "amber", icon: Activity },
  mobile: { tone: "teal", icon: Smartphone },
  specialist: { tone: "rose", icon: ShieldCheck },
  "security-testing": { tone: "rose", icon: ShieldCheck },
  sdet: { tone: "plum", icon: Code },
  "sdet-architecture": { tone: "plum", icon: Code },
  "data-ai-testing": { tone: "teal", icon: Brain },
  "ai-engineering": { tone: "plum", icon: Brain },
  "ai-engineering-interview": { tone: "plum", icon: Brain },
};

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

export type ThumbKind = "track" | "mock" | "interview" | "project";

const KIND_ICON: Record<ThumbKind, LucideIcon> = {
  track: Sparkles,
  mock: Timer,
  interview: MessagesSquare,
  project: FolderGit2,
};

export function themeFor(key: string, kind: ThumbKind = "track"): VisualTheme & { icon: LucideIcon } {
  const known = KNOWN[key];
  const tone = known?.tone ?? TONES[hash(key) % TONES.length];
  const icon = kind === "track" || kind === "mock" ? (known?.icon ?? KIND_ICON[kind]) : kind === "interview" ? (known?.icon ?? Bug) : KIND_ICON[kind];
  return { ...PALETTE[tone], icon };
}

/** Learning Center filter categories (UI grouping of tracks, not content). */
export const TRACK_CATEGORIES = [
  { id: "foundations", label: "Foundations" },
  { id: "automation", label: "Automation & code" },
  { id: "api", label: "API" },
  { id: "performance", label: "Performance" },
  { id: "mobile", label: "Mobile" },
  { id: "specialist", label: "Specialist" },
] as const;

export type TrackCategory = (typeof TRACK_CATEGORIES)[number]["id"];

const TRACK_CATEGORY: Record<string, TrackCategory> = {
  "manual-testing": "foundations",
  automation: "automation",
  sdet: "automation",
  "api-testing": "api",
  performance: "performance",
  jmeter: "performance",
  mobile: "mobile",
  specialist: "specialist",
};

export function trackCategory(slug: string): TrackCategory {
  return TRACK_CATEGORY[slug] ?? "specialist";
}

const LEVEL_ORDER = ["beginner", "intermediate", "advanced"] as const;

/** "Beginner", or "Beginner – Advanced" for a spread of levels; null when none. */
export function levelRange(levels: Iterable<string>): string | null {
  const present = new Set(levels);
  const ordered = LEVEL_ORDER.filter((l) => present.has(l));
  if (!ordered.length) return null;
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return ordered.length === 1 ? cap(ordered[0]) : `${cap(ordered[0])} – ${cap(ordered[ordered.length - 1])}`;
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = minutes / 60;
  return `${h >= 10 ? Math.round(h) : Math.round(h * 10) / 10} h`;
}
