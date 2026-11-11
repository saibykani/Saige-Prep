export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "saige-theme";

const listeners = new Set<() => void>();

export function readThemePreference(): ThemePreference {
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* storage unavailable */
  }
  return "system";
}

export function resolveTheme(pref: ThemePreference): "light" | "dark" {
  if (pref !== "system") return pref;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applyTheme(pref: ThemePreference) {
  document.documentElement.dataset.theme = resolveTheme(pref);
}

export function setThemePreference(pref: ThemePreference) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    /* storage unavailable */
  }
  applyTheme(pref);
  listeners.forEach((l) => l());
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  const mq = window.matchMedia?.("(prefers-color-scheme: light)");
  const onSystem = () => {
    if (readThemePreference() === "system") applyTheme("system");
    listener();
  };
  mq?.addEventListener("change", onSystem);
  return () => {
    listeners.delete(listener);
    mq?.removeEventListener("change", onSystem);
  };
}


/* ---------------- Accent themes (brand colour only; see globals.css) ---------------- */

export const ACCENTS = ["evergreen", "indigo", "coral", "plum"] as const;
export type Accent = (typeof ACCENTS)[number];
export const ACCENT_STORAGE_KEY = "saige-accent";

const accentListeners = new Set<() => void>();

export function readAccent(): Accent {
  try {
    const v = window.localStorage.getItem(ACCENT_STORAGE_KEY);
    if ((ACCENTS as readonly string[]).includes(v ?? "")) return v as Accent;
  } catch {
    /* storage unavailable */
  }
  return "evergreen";
}

export function applyAccent(accent: Accent) {
  const root = document.documentElement;
  if (accent === "evergreen") delete root.dataset.accent;
  else root.dataset.accent = accent;
}

export function setAccent(accent: Accent) {
  try {
    window.localStorage.setItem(ACCENT_STORAGE_KEY, accent);
  } catch {
    /* storage unavailable */
  }
  applyAccent(accent);
  accentListeners.forEach((l) => l());
}

export function subscribeAccent(listener: () => void) {
  accentListeners.add(listener);
  return () => {
    accentListeners.delete(listener);
  };
}
/** Inline, pre-paint script: sets data-theme and data-accent before first render to avoid a flash. */
export const themeInitScript = `(function(){var d=document.documentElement;try{var p=localStorage.getItem("${THEME_STORAGE_KEY}");var t=p==="light"||p==="dark"?p:(window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");d.dataset.theme=t;var a=localStorage.getItem("${ACCENT_STORAGE_KEY}");if(a==="indigo"||a==="coral"||a==="plum")d.dataset.accent=a;}catch(e){d.dataset.theme="dark";}})();`;
