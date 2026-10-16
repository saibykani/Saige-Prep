"use client";

import { useEffect, useState } from "react";

type Line = { text: string; kind: "cmd" | "pass" | "info" | "summary" };

// Decorative sample run. It illustrates the kinds of suites the platform teaches and is not real data.
const LINES: Line[] = [
  { text: "$ mvn test -Dsuite=regression.xml", kind: "cmd" },
  { text: "✓ LoginTest.validCredentials            312 ms", kind: "pass" },
  { text: "✓ CheckoutTest.boundaryQuantity_100     488 ms", kind: "pass" },
  { text: "✓ OrdersApiTest.createOrder → 201        96 ms", kind: "pass" },
  { text: "✓ OrdersApiTest.schemaMatchesContract    41 ms", kind: "pass" },
  { text: "✓ MobileCartTest.addItem (Appium)       1.9 s", kind: "pass" },
  { text: "› JMeter payments: p95 412 ms < 500 ms SLA", kind: "info" },
  { text: "Tests run: 5, Failures: 0, Skipped: 0 — BUILD SUCCESS", kind: "summary" },
];

const STEP_MS = 650;
const HOLD_MS = 3200;

const color: Record<Line["kind"], string> = {
  cmd: "text-foreground",
  pass: "text-[#7fd6b0]",
  info: "text-[#b9adf8]",
  summary: "text-[#ecc77f] font-medium",
};

export function TestRunTerminal() {
  const [visible, setVisible] = useState(LINES.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let count = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      count = count >= LINES.length ? 0 : count + 1;
      setVisible(count);
      timer = setTimeout(tick, count === LINES.length ? HOLD_MS : STEP_MS);
    };
    timer = setTimeout(tick, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      aria-hidden
      className="relative overflow-hidden rounded-xl border border-border bg-[#0c0c0e]/90 shadow-2xl shadow-black/50 backdrop-blur"
    >
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ef6f6c]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#e0b25a]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#4fbf8f]/70" />
        <span className="ml-3 font-mono text-[11px] text-subtle">regression-suite — sample run</span>
      </div>
      <div className="relative h-[228px] px-4 py-3 font-mono text-[12.5px] leading-6">
        <div className="scanline pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" />
        {LINES.slice(0, visible).map((line, i) => (
          <div key={`${i}-${line.text}`} className={`terminal-line whitespace-pre ${color[line.kind]}`}>
            {line.text}
          </div>
        ))}
        {visible < LINES.length && <span className="caret inline-block h-4 w-2 translate-y-0.5 bg-accent" />}
      </div>
    </div>
  );
}
