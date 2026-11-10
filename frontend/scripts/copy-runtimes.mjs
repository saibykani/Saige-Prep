// Copies the Pyodide runtime from node_modules into public/pyodide so Python exercises can run
// in the browser from this site's own origin (the CSP only allows 'self'). Runs before dev and build;
// the copied files are git-ignored. Idempotent: skips files that are already up to date.
import { copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const from = path.join(root, "node_modules", "pyodide");
const to = path.join(root, "public", "pyodide");
const FILES = ["pyodide.js", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json", "package.json"];

await mkdir(to, { recursive: true });
let copied = 0;
for (const file of FILES) {
  const src = path.join(from, file);
  const dest = path.join(to, file);
  const [a, b] = await Promise.all([stat(src), stat(dest).catch(() => null)]);
  if (b && b.size === a.size && b.mtimeMs >= a.mtimeMs) continue;
  await copyFile(src, dest);
  copied++;
}
console.log(`pyodide runtime: ${copied} file(s) copied to public/pyodide`);
