import type { NextConfig } from "next";

// FastAPI backend. Browser requests stay same-origin and are rewritten server-side,
// so the session cookie is first-party and CORS is not needed in the browser path.
// Rewrites are resolved at build time: set BACKEND_URL before `next build`.
// Default port 8010 avoids clashing with other local services commonly bound to 8000.
const backendUrl = (process.env.BACKEND_URL ?? "http://127.0.0.1:8010").replace(/\/$/, "");

// 'unsafe-inline' scripts: Next's inline bootstrap and the pre-paint theme script (no nonce, so pages stay static).
// 'wasm-unsafe-eval': sql.js in the SQL lab. Dev additionally needs 'unsafe-eval' for React tooling.
const isDev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Login is disabled: the home and login pages open the dashboard directly.
  async redirects() {
    return [
      { source: "/", destination: "/dashboard", permanent: false },
      { source: "/login", destination: "/dashboard", permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
      { source: "/backend/health", destination: `${backendUrl}/health` },
      { source: "/backend/ready", destination: `${backendUrl}/ready` },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
