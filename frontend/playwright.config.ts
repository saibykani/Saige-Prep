import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

/**
 * End-to-end tests run against an isolated stack:
 *   backend  -> http://127.0.0.1:8100, database saige_prep_e2e (reset before the run)
 *   frontend -> http://127.0.0.1:3100, rewriting /api to the e2e backend
 * so they never touch development data.
 */
const backendDir = path.resolve(__dirname, "../backend");
const python = process.platform === "win32" ? ".venv\\Scripts\\python.exe" : ".venv/bin/python";
const e2eEnv = {
  APP_ENV: "test",
  MONGODB_DATABASE: "saige_prep_e2e",
  FRONTEND_ORIGIN: "http://127.0.0.1:3100",
  SESSION_SECRET: "e2e-only-secret-not-for-real-use-0123456789",
  // Generous so repeated logins across tests are not throttled; the limiter itself is covered by backend tests.
  LOGIN_RATE_LIMIT: "100",
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: `${python} -m uvicorn app.main:app --host 127.0.0.1 --port 8100`,
      cwd: backendDir,
      url: "http://127.0.0.1:8100/ready",
      env: e2eEnv,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: "npx next dev --port 3100 --hostname 127.0.0.1",
      url: "http://127.0.0.1:3100/login",
      // E2E always exercises the real sign-in flow.
      env: { BACKEND_URL: "http://127.0.0.1:8100", NEXT_PUBLIC_AUTH_REQUIRED: "true" },
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});

export { backendDir, e2eEnv, python };
