import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Base64Tool, JsonTool, RegexTool, TestDataTool, TimestampTool, XmlTool } from "@/features/toolkit/data-tools";
import { BvaTool, EquivalenceTool, PairwiseTool } from "@/features/toolkit/design-tools";
import {
  GitCheatsheetTool,
  HttpHeadersTool,
  HttpStatusTool,
  ResourcesTool,
  SqlCheatsheetTool,
  TemplatesTool,
} from "@/features/toolkit/reference-tools";
import { TOOLS } from "@/lib/registry";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

const TOOL_COMPONENTS = {
  json: JsonTool,
  xml: XmlTool,
  base64: Base64Tool,
  regex: RegexTool,
  timestamp: TimestampTool,
  "test-data": TestDataTool,
  bva: BvaTool,
  equivalence: EquivalenceTool,
  pairwise: PairwiseTool,
  "http-status": HttpStatusTool,
  "http-headers": HttpHeadersTool,
  "sql-cheatsheet": SqlCheatsheetTool,
  "git-cheatsheet": GitCheatsheetTool,
  resources: ResourcesTool,
  templates: TemplatesTool,
} as const;

type Props = { params: Promise<{ tool: string }> };

export function generateStaticParams() {
  return TOOLS.map((t) => ({ tool: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params;
  return { title: TOOLS.find((t) => t.slug === tool)?.title ?? "Tool" };
}

export default async function ToolPage({ params }: Props) {
  const { tool } = await params;
  const Tool = TOOL_COMPONENTS[tool as keyof typeof TOOL_COMPONENTS];
  if (!Tool) notFound();
  return <Tool />;
}
