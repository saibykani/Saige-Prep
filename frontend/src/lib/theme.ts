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

/** Inline, pre-paint script: sets data-theme before first render to avoid a flash. */
export const themeInitScript = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}");var t=p==="light"||p==="dark"?p:(window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="dark";}})();`;
