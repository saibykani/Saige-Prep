// Verifies lesson videos against YouTube's public oEmbed endpoint, and helps find candidates.
// oEmbed: 200 = exists and embeddable; 401/403 = embedding disabled; 400/404 = missing or private.
// Usage:
//   node scripts/check-videos.mjs                     check every video in content/lessons
//   node scripts/check-videos.mjs <id> ...            check specific IDs (prints title and channel)
//   node scripts/check-videos.mjs --search "<query>"  list search results ranked by view count
//   node scripts/check-videos.mjs --views <id> ...    exact view count from each watch page
//   node scripts/check-videos.mjs --audit [min]       slow serial view audit of every lesson video (flags < min, default 10,000)
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const root = path.resolve(import.meta.dirname, "../content/lessons");

async function oembed(id) {
  const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`;
  const res = await fetch(url);
  if (!res.ok) return { ok: false, status: res.status };
  const data = await res.json();
  return { ok: true, status: res.status, title: data.title, channel: data.author_name };
}

/** Parses the public search results page; view counts come from YouTube's own "N views" text. */
async function search(query) {
  const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en&gl=US`, {
    headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "en-US" },
  });
  const html = await res.text();
  const seen = new Map();
  // Split into one chunk per result first, so a field missing from one result can never be
  // borrowed from the next one (that previously mis-attributed view counts).
  for (const chunk of html.split('"videoRenderer":{').slice(1)) {
    const id = chunk.match(/^"videoId":"([A-Za-z0-9_-]{11})"/)?.[1];
    const title = chunk.match(/"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/)?.[1];
    const channel = chunk.match(/"ownerText":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/)?.[1];
    const views = chunk.match(/"viewCountText":\{"simpleText":"([\d,]+) views?"/)?.[1];
    if (!id || !title || !channel || !views || seen.has(id)) continue;
    seen.set(id, { id, title: JSON.parse(`"${title}"`), channel: JSON.parse(`"${channel}"`), views: Number(views.replace(/,/g, "")) });
  }
  return [...seen.values()].sort((a, b) => b.views - a.views);
}

async function checkAll() {
  let checked = 0;
  const failures = [];
  for (const track of await readdir(root)) {
    for (const file of await readdir(path.join(root, track))) {
      if (!file.endsWith(".md")) continue;
      const { data } = matter(await readFile(path.join(root, track, file), "utf8"));
      for (const v of data.videos ?? []) {
        checked++;
        const r = await oembed(v.id);
        if (!r.ok) failures.push(`${track}/${file}: ${v.id} "${v.title}" → HTTP ${r.status}`);
        else if (r.channel !== v.channel) failures.push(`${track}/${file}: ${v.id} channel is "${r.channel}", lesson says "${v.channel}"`);
      }
    }
  }
  console.log(`${checked} videos checked, ${failures.length} problems`);
  for (const f of failures) console.log("  " + f);
  return failures.length ? 1 : 0;
}

class RateLimited extends Error {}

/** Exact view count from the video's own watch page (videoDetails.viewCount). */
async function views(id) {
  const res = await fetch(`https://www.youtube.com/watch?v=${id}&hl=en`, {
    headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "en-US" },
    redirect: "manual",
  });
  // YouTube answers automated bursts with a redirect to google.com/sorry (a captcha page).
  if (res.status >= 300 && res.status < 400) throw new RateLimited(`redirected to ${res.headers.get("location")}`);
  const m = (await res.text()).match(/"videoDetails":\{"videoId":"[A-Za-z0-9_-]{11}"[\s\S]*?"viewCount":"(\d+)"/);
  return m ? Number(m[1]) : null;
}

/** Slow, serial view-count audit of every lesson video; stops at the first sign of rate limiting. */
async function audit(minViews, delayMs = 4000) {
  const rows = [];
  for (const track of await readdir(root)) {
    for (const file of await readdir(path.join(root, track))) {
      if (!file.endsWith(".md")) continue;
      const { data } = matter(await readFile(path.join(root, track, file), "utf8"));
      for (const v of data.videos ?? []) rows.push({ lesson: `${track}/${file.replace(/\.md$/, "")}`, ...v });
    }
  }
  for (const [i, row] of rows.entries()) {
    try {
      row.views = await views(row.id);
    } catch (e) {
      if (e instanceof RateLimited) {
        console.log(`Rate limited after ${i} of ${rows.length} videos (${e.message}). Try again later.`);
        break;
      }
      throw e;
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  const done = rows.filter((r) => r.views != null).sort((a, b) => a.views - b.views);
  for (const r of done) console.log(`${r.views.toLocaleString("en-US").padStart(12)}  ${r.views < minViews ? "LOW " : "    "} ${r.lesson}  ${r.id}  ${r.title} — ${r.channel}`);
  console.log(`${done.length}/${rows.length} measured, ${done.filter((r) => r.views < minViews).length} below ${minViews.toLocaleString("en-US")} views`);
}

const args = process.argv.slice(2);
if (args[0] === "--audit") {
  await audit(Number(args[1] ?? 10000));
} else if (args[0] === "--views") {
  for (const id of args.slice(1)) {
    const n = await views(id).catch((e) => (e instanceof RateLimited ? "rate-limited" : Promise.reject(e)));
    console.log(`${String(typeof n === "number" ? n.toLocaleString("en-US") : (n ?? "unknown")).padStart(12)}  ${id}`);
  }
} else if (args[0] === "--search") {
  for (const r of await search(args.slice(1).join(" "))) console.log(`${r.views.toLocaleString("en-US").padStart(12)}  ${r.id}  ${r.title}  —  ${r.channel}`);
} else if (args.length) {
  for (const id of args) {
    const r = await oembed(id);
    console.log(r.ok ? `OK   ${id}  ${r.title}  —  ${r.channel}` : `FAIL ${id}  HTTP ${r.status}`);
  }
} else {
  process.exitCode = await checkAll();
}
