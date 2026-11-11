"use client";

import { useEffect, useId, useState } from "react";
import { Alert, Skeleton } from "@/components/ui/feedback";

let initializedFor: string | null = null;

const PALETTES = {
  dark: {
    darkMode: true,
    background: "#151d22",
    primaryColor: "#173430",
    primaryTextColor: "#e8eef0",
    primaryBorderColor: "#45c4ab",
    lineColor: "#86959c",
    secondaryColor: "#2a2a1c",
    tertiaryColor: "#1c252b",
  },
  light: {
    darkMode: false,
    background: "#ffffff",
    primaryColor: "#e4f1ee",
    primaryTextColor: "#1a2126",
    primaryBorderColor: "#0c6e60",
    lineColor: "#5f6b73",
    secondaryColor: "#fbf1df",
    tertiaryColor: "#f1eee8",
  },
} as const;

/** Renders a Mermaid diagram client-side. Mermaid is loaded lazily, only on pages that use it. */
export function MermaidDiagram({ chart, caption }: { chart: string; caption?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
        if (initializedFor !== theme) {
          mermaid.initialize({
            startOnLoad: false,
            // "strict" disables click handlers and HTML labels from diagram source.
            securityLevel: "strict",
            theme: "base",
            themeVariables: {
              ...PALETTES[theme],
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              fontSize: "14px",
            },
          });
          initializedFor = theme;
        }
        const { svg: rendered } = await mermaid.render(`mmd-${id}`, chart);
        if (!cancelled) setSvg(rendered);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not render diagram");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <Alert tone="error" title="Diagram could not be rendered">
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-xs">{chart}</pre>
      </Alert>
    );
  }

  return (
    <figure className="my-6 overflow-x-auto rounded-xl border border-border bg-surface p-4">
      {svg ? (
        // Mermaid output is generated from author-controlled content with securityLevel "strict".
        <div role="img" aria-label={caption ?? "Diagram"} className="flex justify-center [&_svg]:h-auto [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <Skeleton className="h-48 w-full" />
      )}
      {caption && <figcaption className="mt-3 text-center text-xs text-muted">{caption}</figcaption>}
    </figure>
  );
}
