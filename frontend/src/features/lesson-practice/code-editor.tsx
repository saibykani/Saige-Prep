"use client";

import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import CodeMirror from "@uiw/react-codemirror";
import { useSyncExternalStore } from "react";
import type { CodingExercise } from "@/content/schema";

const LANGS = {
  python: () => python(),
  javascript: () => javascript(),
  typescript: () => javascript({ typescript: true }),
  sql: () => sql(),
  java: () => java(),
} satisfies Record<CodingExercise["language"], () => unknown>;

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/** Syntax-highlighted editor that follows the site's light/dark theme. */
export default function CodeEditor({
  value,
  onChange,
  language,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  language: CodingExercise["language"];
  label: string;
}) {
  const dark = useSyncExternalStore(subscribeTheme, () => document.documentElement.dataset.theme !== "light", () => true);
  return (
    <div className="overflow-hidden rounded-lg border border-border text-[13px]">
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={dark ? "dark" : "light"}
        extensions={[LANGS[language]() as never]}
        minHeight="180px"
        maxHeight="460px"
        basicSetup={{ foldGutter: false, highlightActiveLineGutter: true, autocompletion: false }}
        aria-label={label}
      />
    </div>
  );
}
