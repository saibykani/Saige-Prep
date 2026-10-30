/** Static registries for toolkit utilities and practice-lab exercises (shared by pages and search). */

export interface ToolEntry {
  slug: string;
  title: string;
  description: string;
  group: "Data & encoding" | "Test design" | "References" | "Templates";
  keywords: string[];
}

export const TOOLS: ToolEntry[] = [
  { slug: "json", title: "JSON formatter, validator & diff", description: "Pretty-print, minify, validate and compare two JSON documents.", group: "Data & encoding", keywords: ["json", "format", "validate", "compare", "diff"] },
  { slug: "xml", title: "XML formatter & validator", description: "Check well-formedness and pretty-print XML (e.g. JMeter .jmx, SOAP).", group: "Data & encoding", keywords: ["xml", "soap", "jmx"] },
  { slug: "base64", title: "Base64 encode / decode", description: "Encode or decode Base64, including JWT segments (Base64URL).", group: "Data & encoding", keywords: ["base64", "jwt", "encode", "decode"] },
  { slug: "regex", title: "Regex tester", description: "Test JavaScript regular expressions with flags and match groups.", group: "Data & encoding", keywords: ["regex", "regular expression", "pattern", "extractor"] },
  { slug: "timestamp", title: "Timestamp converter", description: "Convert Unix epoch seconds/milliseconds and ISO-8601 dates across time zones.", group: "Data & encoding", keywords: ["epoch", "unix", "iso", "date", "time zone"] },
  { slug: "test-data", title: "Test data generator", description: "Generate synthetic names, emails, phone numbers, IDs and boundary strings.", group: "Data & encoding", keywords: ["fake", "synthetic", "data", "generator", "csv"] },
  { slug: "bva", title: "Boundary value helper", description: "Turn a numeric range and precision into two- and three-value boundary tests.", group: "Test design", keywords: ["boundary", "bva", "edge", "range"] },
  { slug: "equivalence", title: "Equivalence partitioning helper", description: "Define valid/invalid partitions and pick representative values.", group: "Test design", keywords: ["equivalence", "partition", "ep"] },
  { slug: "pairwise", title: "Pairwise combination generator", description: "Generate an all-pairs test set for several parameters.", group: "Test design", keywords: ["pairwise", "all pairs", "combinatorial"] },
  { slug: "http-status", title: "HTTP status code reference", description: "Every common status code with meaning and testing notes.", group: "References", keywords: ["http", "status", "401", "403", "404", "500"] },
  { slug: "http-headers", title: "HTTP header reference", description: "Request/response headers testers check: caching, auth, CORS, security.", group: "References", keywords: ["headers", "cors", "cache-control", "content-type"] },
  { slug: "sql-cheatsheet", title: "SQL cheat sheet", description: "Queries testers use daily: joins, aggregates, duplicates, orphans.", group: "References", keywords: ["sql", "join", "group by", "query"] },
  { slug: "git-cheatsheet", title: "Git command reference", description: "Everyday Git for test engineers: branches, rebase, stash, bisect.", group: "References", keywords: ["git", "branch", "commit", "rebase"] },
  { slug: "resources", title: "Resource library", description: "Curated official documentation and learning links for every major tool.", group: "References", keywords: ["links", "docs", "documentation", "selenium", "postman", "jmeter"] },
  { slug: "templates", title: "QA templates", description: "Test plan, test case, defect report, API checklist and performance test plan templates.", group: "Templates", keywords: ["template", "test plan", "defect report", "checklist"] },
];

export interface PracticeEntry {
  slug: string;
  title: string;
  description: string;
  area: "Manual" | "Automation" | "API" | "SQL" | "Performance";
  keywords: string[];
}

export const PRACTICE: PracticeEntry[] = [
  { slug: "test-design", title: "Test design lab", description: "Design boundary, partition and decision-table tests for real requirements; checked automatically.", area: "Manual", keywords: ["bva", "equivalence", "decision table", "test cases"] },
  { slug: "requirements", title: "Requirements review lab", description: "Find ambiguities, missing requirements and edge cases in sample user stories.", area: "Manual", keywords: ["requirements", "ambiguity", "user story", "edge cases"] },
  { slug: "defect-report", title: "Defect report lab", description: "Write a defect report for a broken feature and compare it with a model report.", area: "Manual", keywords: ["defect", "bug report", "severity", "priority"] },
  { slug: "code", title: "Code & debugging challenges", description: "Predict output, spot locator and synchronisation bugs, and fix flawed test code.", area: "Automation", keywords: ["java", "selenium", "debug", "predict output", "locator"] },
  { slug: "api", title: "API lab", description: "Send real requests to a safe built-in mock API: auth, CRUD, validation errors and chaining.", area: "API", keywords: ["api", "rest", "postman", "status code", "json"] },
  { slug: "sql", title: "SQL lab", description: "Run SQL safely in your browser against a sample e-commerce database.", area: "SQL", keywords: ["sql", "sqlite", "join", "query", "database"] },
  { slug: "performance", title: "Performance analysis lab", description: "Compute percentiles, apply Little's Law and diagnose a payment workload from sample results.", area: "Performance", keywords: ["percentile", "p95", "throughput", "little's law", "jmeter"] },
];
