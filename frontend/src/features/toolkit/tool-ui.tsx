"use client";

import { ArrowLeft, Check, Copy, Download, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode, type TextareaHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ToolShell({ title, description, children, local = true }: { title: string; description: string; children: ReactNode; local?: boolean }) {
  return (
    <div className="animate-fade-in space-y-5">
      <Link href="/toolkit" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden /> QA Toolkit
      </Link>
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted">{description}</p>
        {local && (
          <p className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success-soft px-2.5 py-1 text-[11px] text-success">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Runs entirely in your browser — nothing you paste is sent anywhere.
          </p>
        )}
      </header>
      {children}
    </div>
  );
}

export function Editor({ label, id, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; id: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        spellCheck={false}
        className={cn(
          "min-h-40 w-full resize-y rounded-xl border border-border bg-code-bg p-3 font-mono text-[13px] leading-6 text-code-foreground placeholder:text-subtle focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={!text}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {copied ? "Copied" : label}
    </Button>
  );
}

export function DownloadButton({ text, filename, mime = "text/plain" }: { text: string; filename: string; mime?: string }) {
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={!text}
      onClick={() => {
        const url = URL.createObjectURL(new Blob([text], { type: mime }));
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      <Download className="h-3.5 w-3.5" aria-hidden /> Download
    </Button>
  );
}

export function Output({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "error" | "success" }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <CopyButton text={value} />
      </div>
      <pre
        className={cn(
          "max-h-[28rem] min-h-24 overflow-auto whitespace-pre-wrap break-words rounded-xl border p-3 font-mono text-[13px] leading-6",
          tone === "error" ? "border-danger/30 bg-danger-soft text-danger" : tone === "success" ? "border-success/30 bg-code-bg text-code-foreground" : "border-border bg-code-bg text-code-foreground",
        )}
        aria-live="polite"
      >
        {value || " "}
      </pre>
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-border bg-surface p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors", value === o.value ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
