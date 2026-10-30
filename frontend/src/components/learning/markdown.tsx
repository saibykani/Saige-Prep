"use client";

import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/ui/code-block";
import { slugify } from "@/lib/markdown-utils";
import { cn } from "@/lib/utils";
import { MermaidDiagram } from "./mermaid-diagram";

function textOf(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textOf).join("");
  if (children && typeof children === "object" && "props" in children) {
    return textOf((children as { props: { children?: React.ReactNode } }).props.children);
  }
  return "";
}

const components: Components = {
  h2: ({ children }) => (
    <h2 id={slugify(textOf(children))} className="mt-10 scroll-mt-20 border-b border-border pb-2 text-xl font-semibold tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 id={slugify(textOf(children))} className="mt-8 scroll-mt-20 text-base font-semibold">
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="my-4 leading-7 text-foreground/90">{children}</p>,
  ul: ({ children }) => <ul className="my-4 list-disc space-y-1.5 pl-6 marker:text-subtle">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-1.5 pl-6 marker:text-subtle">{children}</ol>,
  li: ({ children }) => <li className="leading-7 text-foreground/90">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="my-5 border-l-2 border-accent bg-accent-soft/40 px-4 py-1 text-foreground/85">{children}</blockquote>
  ),
  a: ({ href = "", children }) => {
    if (href.startsWith("/")) {
      return (
        <Link href={href} className="text-accent underline-offset-4 hover:underline">
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline-offset-4 hover:underline">
        {children}
      </a>
    );
  },
  table: ({ children }) => (
    <div className="my-5 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-surface-raised">{children}</thead>,
  th: ({ children }) => <th className="border-b border-border px-3 py-2 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-b border-border/60 px-3 py-2 align-top text-foreground/90">{children}</td>,
  hr: () => <hr className="my-8 border-border" />,
  code: ({ className, children }) => {
    const language = /language-([\w-]+)/.exec(className ?? "")?.[1];
    const code = String(children).replace(/\n$/, "");
    if (language === "mermaid") return <MermaidDiagram chart={code} />;
    if (language || code.includes("\n")) return <CodeBlock code={code} language={language} className="my-5" />;
    return <code className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-[0.85em] text-code-inline">{children}</code>;
  },
  // Code blocks are rendered by `code`; drop the wrapping <pre> so we don't nest.
  pre: ({ children }) => <>{children}</>,
};

/** Safe Markdown renderer: GFM tables/lists, sanitized HTML, code blocks, Mermaid diagrams. */
export function Markdown({ source, className }: { source: string; className?: string }) {
  return (
    <div className={cn("text-[15px]", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
