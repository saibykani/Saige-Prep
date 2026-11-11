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

/**
 * Curated, low-saturation hues that sit beside the brand without competing with it.
 * Thumbnails are dark enough for white icons; hub heroes use `via` only as a light tint and stripe.
 */
export const PALETTE: Record<string, VisualTheme> = {
  evergreen: { from: "#12403a", via: "#1d5f55", to: "#3a8c7d", pattern: "dots" },
  indigo: { from: "#252a55", via: "#373d78", to: "#5a60a6", pattern: "waves" },
  clay: { from: "#4d2419", via: "#723727", to: "#a15a40", pattern: "diagonal" },
  moss: { from: "#24391d", via: "#36532b", to: "#5d7f4b", pattern: "grid" },
  rosewood: { from: "#47202a", via: "#68303d", to: "#94566a", pattern: "dots" },
  ochre: { from: "#46310f", via: "#674a18", to: "#957130", pattern: "grid" },
  ocean: { from: "#123446", via: "#1d4b63", to: "#3a7290", pattern: "diagonal" },
  plum: { from: "#3a1e3a", via: "#552f55", to: "#80527e", pattern: "waves" },
};

export type Tone = keyof typeof PALETTE;
const TONES = Object.keys(PALETTE) as Tone[];

/** Fixed look per known track / bank / interview slug; anything else is hashed (deterministic). */
const KNOWN: Record<string, { tone: Tone; icon: LucideIcon }> = {
  "manual-testing": { tone: "evergreen", icon: ClipboardCheck },
  "manual-qa": { tone: "evergreen", icon: ClipboardCheck },
  automation: { tone: "indigo", icon: Bot },
  "api-testing": { tone: "moss", icon: Webhook },
  performance: { tone: "clay", icon: Gauge },
  jmeter: { tone: "ochre", icon: Activity },
  mobile: { tone: "ocean", icon: Smartphone },
  specialist: { tone: "rosewood", icon: ShieldCheck },
  "security-testing": { tone: "rosewood", icon: ShieldCheck },
  sdet: { tone: "plum", icon: Code },
  "sdet-architecture": { tone: "plum", icon: Code },
  "data-ai-testing": { tone: "ocean", icon: Brain },
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
  { id: "ai", label: "AI & ML" },
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
  "ai-engineering": "ai",
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
