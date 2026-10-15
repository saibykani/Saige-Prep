import { execFileSync } from "node:child_process";
import path from "node:path";
import { backendDir, e2eEnv, python } from "../playwright.config";

/** Drops and re-seeds the saige_prep_e2e database so every run starts from the same state. */
export default function globalSetup() {
  execFileSync(path.join(backendDir, python), ["-m", "scripts.e2e_reset"], {
    cwd: backendDir,
    env: { ...process.env, ...e2eEnv },
    stdio: "inherit",
  });
}
