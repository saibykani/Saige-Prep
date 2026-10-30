/** Performance analysis exercises. Sample data is synthetic and illustrative. */

/** 20 synthetic response times (ms) from an illustrative "checkout" sample, in arrival order. */
export const SAMPLE_MS = [210, 135, 800, 160, 120, 300, 190, 1450, 155, 240, 170, 510, 140, 220, 350, 150, 180, 260, 420, 200];

/** Nearest-rank percentile: the value at rank ceil(p/100 × N) in the sorted data. */
export function percentile(values: number[], p: number) {
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.max(1, Math.ceil((p / 100) * sorted.length));
  return sorted[rank - 1];
}

export const mean = (values: number[]) => values.reduce((s, v) => s + v, 0) / values.length;

export type PerfExercise =
  | {
      id: string;
      title: string;
      level: "beginner" | "intermediate" | "advanced";
      kind: "number";
      prompt: string;
      answer: number;
      tolerance: number;
      unit: string;
      explanation: string;
      hint: string;
      usesSample?: boolean;
    }
  | {
      id: string;
      title: string;
      level: "beginner" | "intermediate" | "advanced";
      kind: "choice";
      prompt: string;
      options: string[];
      answer: number;
      explanation: string;
      hint: string;
      usesSample?: boolean;
    };

export const PERF_EXERCISES: PerfExercise[] = [
  {
    id: "pf-lab-01",
    title: "Average response time",
    level: "beginner",
    kind: "number",
    usesSample: true,
    prompt: "Calculate the average (mean) response time of the 20-sample run.",
    answer: mean(SAMPLE_MS),
    tolerance: 0.5,
    unit: "ms",
    explanation: "Sum = 6,360 ms over 20 samples, so the mean is 318 ms. Notice it's well above most individual requests — two slow outliers pull it up.",
    hint: "Add all 20 values, then divide by 20.",
  },
  {
    id: "pf-lab-02",
    title: "Median (p50)",
    level: "beginner",
    kind: "number",
    usesSample: true,
    prompt: "Using the nearest-rank method, what is the median (p50)?",
    answer: percentile(SAMPLE_MS, 50),
    tolerance: 0,
    unit: "ms",
    explanation: "Sort the values. Rank = ceil(0.50 × 20) = 10, so p50 is the 10th value: 200 ms. Half the users waited 200 ms or less — very different from the 318 ms average.",
    hint: "Sort ascending first. Rank = ceil(p/100 × N).",
  },
  {
    id: "pf-lab-03",
    title: "p90",
    level: "intermediate",
    kind: "number",
    usesSample: true,
    prompt: "What is the p90 response time (nearest-rank)?",
    answer: percentile(SAMPLE_MS, 90),
    tolerance: 0,
    unit: "ms",
    explanation: "Rank = ceil(0.90 × 20) = 18, so p90 is the 18th sorted value: 510 ms. 90% of requests finished in 510 ms or less.",
    hint: "0.90 × 20 = 18 → the 18th value in sorted order.",
  },
  {
    id: "pf-lab-04",
    title: "p95",
    level: "intermediate",
    kind: "number",
    usesSample: true,
    prompt: "What is the p95 response time (nearest-rank)?",
    answer: percentile(SAMPLE_MS, 95),
    tolerance: 0,
    unit: "ms",
    explanation: "Rank = ceil(0.95 × 20) = 19 → 800 ms. With only 20 samples, high percentiles rest on one or two data points — real tests need far more samples for a stable p95/p99.",
    hint: "0.95 × 20 = 19.",
  },
  {
    id: "pf-lab-05",
    title: "Why averages mislead",
    level: "beginner",
    kind: "choice",
    usesSample: true,
    prompt: "The SLA is \"95% of checkout requests under 500 ms\". Average = 318 ms. Does the run meet the SLA?",
    options: [
      "Yes — the average is below 500 ms",
      "No — p95 is 800 ms, so more than 5% of requests are slower than 500 ms",
      "Can't tell without the maximum",
      "Yes — the median is 200 ms",
    ],
    answer: 1,
    explanation: "An SLA stated as a percentile must be checked against that percentile. 3 of 20 requests (15%) exceed 500 ms, so the run fails even though the average looks healthy.",
    hint: "Count how many samples are above 500 ms.",
  },
  {
    id: "pf-lab-06",
    title: "Error rate",
    level: "beginner",
    kind: "number",
    prompt: "A 15-minute test sent 24,000 requests; 312 failed (HTTP 5xx or assertion failures). What is the error rate?",
    answer: 1.3,
    tolerance: 0.01,
    unit: "%",
    explanation: "312 / 24,000 = 0.013 = 1.3%. Always say what counts as an error — HTTP status, timeouts and failed assertions should all be included.",
    hint: "errors ÷ total × 100.",
  },
  {
    id: "pf-lab-07",
    title: "Throughput",
    level: "beginner",
    kind: "number",
    prompt: "The same test sent 24,000 requests in 15 minutes at a steady rate. What was the throughput?",
    answer: 26.67,
    tolerance: 0.05,
    unit: "req/s",
    explanation: "15 minutes = 900 s, and 24,000 / 900 ≈ 26.67 requests per second.",
    hint: "Convert minutes to seconds first.",
  },
  {
    id: "pf-lab-08",
    title: "Little's Law",
    level: "intermediate",
    kind: "number",
    prompt: "A payment service handles 50 requests per second with an average response time of 0.4 s. On average, how many requests are in the system at once?",
    answer: 20,
    tolerance: 0,
    unit: "requests",
    explanation: "Little's Law: L = λ × W = 50 req/s × 0.4 s = 20 concurrent requests. Useful for sizing thread and connection pools.",
    hint: "L = λ × W (arrival rate × time in system).",
  },
  {
    id: "pf-lab-09",
    title: "How many virtual users?",
    level: "intermediate",
    kind: "number",
    prompt: "Closed workload: you need 100 transactions per second. Each iteration has 0.5 s response time and 4.5 s think time. How many virtual users are needed?",
    answer: 500,
    tolerance: 0,
    unit: "users",
    explanation: "Users = throughput × (response time + think time) = 100 × (0.5 + 4.5) = 500. Forgetting think time is a classic way to massively under- or over-load a system.",
    hint: "Each user completes one transaction every (response + think) seconds.",
  },
  {
    id: "pf-lab-10",
    title: "Find the bottleneck",
    level: "advanced",
    kind: "choice",
    prompt:
      "Payment load test (illustrative): as load increases, throughput plateaus at ~120 TPS while p95 climbs from 300 ms to 2.4 s. App CPU is 35%, DB CPU 40%. Application metrics show the DB connection pool at 20/20 active, and the 'connection acquire time' keeps growing. What is the most likely bottleneck?",
    options: [
      "The application servers need more CPU",
      "Network bandwidth between load generator and app",
      "Database connection pool exhaustion — requests queue waiting for a connection",
      "The JMeter test plan has too much think time",
    ],
    answer: 2,
    explanation:
      "Low CPU everywhere plus a saturated pool and growing acquire time means requests are queuing for connections, not doing work. Next steps: check slow queries holding connections, and size the pool with Little's Law instead of guessing.",
    hint: "When CPU is low but latency climbs, look for something requests wait on.",
  },
];
