# UI audit and design-system decision (Nov 2026)

## Users and top tasks
- **Career switchers and junior testers**: open a lesson, read it end-to-end, take the practice test, run the coding exercise. Long reading sessions, often in the evening, which makes dark mode and readability critical.
- **Working QA engineers moving to SDET/AI**: jump between tracks, roadmaps and mock tests; scan progress quickly.
- **The owner (single admin)**: wants the product to feel like a premium, enterprise-grade tool they can show to others.

Top tasks by frequency: read lesson → practice/mark → check progress on the dashboard → pick the next track/roadmap.

## What hurt (before)
| Area | Problem | Where |
|---|---|---|
| Perceived quality | Violet/fuchsia/emerald neon gradients, aurora blobs drifting behind every page, twinkling stars, sweeping light beam, spinning rainbow borders. Reads as "AI-generated template", not as a product. | `globals.css` `.app-aurora`, `.cine-*`, `.featured-ring`, `.glow-border`; `cinematic-hero.tsx`; `hub-hero.tsx` |
| Consistency | ~40 hard-coded hex colours and Tailwind `violet-*`/`fuchsia-*`/`emerald-*`/`sky-*` classes bypassed tokens; brand mark, favicon, Mermaid, confetti, practice tints each had their own palette. | `brand-mark.tsx`, `icon.svg`, `video-list.tsx`, `course-card.tsx`, `practice-hub.tsx`, `practice-ui.tsx`, `login-*` |
| Hierarchy | Every hub page opened with a loud multicolour gradient banner with white text, so nothing stood out; gradient-clipped H1s on every PageHeader. | `hub-hero.tsx`, `.text-gradient` |
| Readability | Lesson prose ran the full column width (~110 characters on desktop), 15px/1.75rem; tables and code blocks were flat; non-tabular stat numbers jiggled during count-up. | `markdown.tsx`, lesson `page.tsx`, `code-block.tsx` |
| Density | Hero banners consumed ~40% of the first viewport on hub pages. | `hub-hero.tsx` |
| Accessibility | White text on mid-saturation gradient stops was borderline; continuous infinite animations (aurora 28–34s, mesh, stars, grid pan, rainbow ring) ran forever even though `prefers-reduced-motion` was respected. Focus ring was fine. | `globals.css` |
| Themes | Only light/dark/system. No way to personalise. | `theme.ts` |

## Principles adopted
1. **One brand colour, calm neutrals.** Deep evergreen-teal brand, warm amber highlight reserved for celebration/streaks. Neutrals are slightly warm "paper" in light and deep ink-slate (not black) in dark.
2. **Semantic ≠ brand.** Success (green), warning (orange-amber), danger (red), info (blue-slate) are separate tokens so a "correct" never looks like a link.
3. **Colour does work, decoration doesn't.** Remove ambient motion; keep motion that explains state (stagger-in, count-up, progress fill, ring draw, hover lift, view transitions).
4. **Delight only for real achievements.** Confetti + check-draw when a practice test is passed (≥60%, the existing "Pass" band) or every coding check passes. No fake numbers.
5. **Readable first.** Lesson prose capped at 72ch, 16px/1.75, stronger H1/H2, tabular numbers for stats, framed tables and code.
6. **Tokens, not per-theme code.** Accent themes only re-map brand tokens.

## Token architecture
- `globals.css :root` (dark default) and `:root[data-theme="light"]` define neutrals, brand, highlight, semantic, code, shadows, radii and easing.
- `:root[data-accent="indigo|coral|plum"]` (+ `[data-theme="light"]` variants) override only `--accent*`, `--ring`, `--code-inline`. Evergreen = no attribute.
- New tokens (existing names kept): `--accent-ink` (deep brand stage), `--accent-bright` (brand on the ink stage, theme-independent), `--highlight(-soft)`, `--info(-soft)`, `--radius-card`, `--radius-control`, `--ease-out`, `--ease-spring`. Exposed to Tailwind as `bg-accent-ink`, `text-accent-bright`, `text-highlight`, `text-info`, etc.
- Accent persisted in `localStorage["saige-accent"]`, applied pre-paint in `themeInitScript` (no flash), picked in Settings → Appearance (`accent-picker.tsx`).
- Track/hub tones (`lib/visual-themes.ts`): 8 curated low-saturation hues (evergreen, indigo, clay, moss, rosewood, ochre, ocean, plum).

## Contrast (WCAG 2.x, computed)
Dark: bg `#0f1519` / surface `#151d22` / raised `#1c252b`. Light: bg `#f8f6f2` / surface `#ffffff` / raised `#f1eee8`.

| Token | Dark value | on bg / surface / raised | Light value | on bg / surface / raised |
|---|---|---|---|---|
| foreground | #e8eef0 | 15.7 / 14.6 / 13.3 | #1a2126 | 15.1 / 16.3 / 14.1 |
| muted | #a3b0b6 | 8.3 / 7.7 / 7.0 | #4c575e | 6.9 / 7.4 / 6.4 |
| subtle | #86959c | 6.0 / 5.5 / 5.0 | #5f6b73 | 5.1 / 5.5 / 4.7 |
| accent (evergreen) | #45c4ab | 8.5 / 7.9 / 7.2 | #0c6e60 | 5.7 / 6.2 / 5.3 |
| accent indigo | #a3a8f5 | 8.3 / 7.7 / 7.0 | #4d50b8 | 6.2 / 6.7 / 5.8 |
| accent coral | #f39882 | 8.4 / 7.8 / 7.1 | #b23e29 | 5.4 / 5.8 / 5.0 |
| accent plum | #d7a0d2 | 8.6 / 8.0 / 7.3 | #82387e | 6.9 / 7.5 / 6.4 |
| highlight | #f2b65c | 10.2 / 9.4 / 8.6 | #9a5a08 | 5.1 / 5.5 / 4.7 |
| success | #5fcf85 | 9.4 / 8.7 / 8.0 | #17783f | 5.1 / 5.5 / 4.8 |
| warning | #e9a94c | 9.0 / 8.3 / 7.6 | #8a5a06 | 5.5 / 5.9 / 5.1 |
| danger | #f3837a | 7.3 / 6.8 / 6.2 | #b8382d | 5.3 / 5.8 / 5.0 |
| info | #7fb8e8 | 8.7 / 8.1 / 7.4 | #26608f | 6.2 / 6.7 / 5.8 |

Text on accent buttons: dark-mode accent-foreground on accent 7.9–8.3:1 for all four accents; light-mode white on accent 5.8–6.7:1. Dashboard hero text is white (≥75% opacity) on `--accent-ink` (≈14:1 for solid white).

## Motion changes
- Removed: app-wide aurora, hero orbs, light beam, twinkling stars, grid pan, rotating rainbow borders (featured card, sign-in card), gradient text shine, scanline.
- Toned down: word reveal (no blur/3D), panel parallax (8° → 3°), lift distance, streak glow pulses 3× instead of forever, live dot pings 3×.
- Kept: stagger-in, count-up, progress fill, ring draw, bar grow, hover lift, view transitions, ripple, skeleton.
- Added: `.celebrate` success banner + confetti/check-draw on passed practice tests and fully passing coding exercises.
- All of it stops under `prefers-reduced-motion`.

## Deliberately NOT changed
Routes, data, behaviour, copy asserted by tests, component APIs and token names (`bg-surface`, `text-muted`, `text-accent`, `shadow-card`, …), fonts (Geist), layout grid and navigation, content under `frontend/content/**`, backend.

## Trade-off: leaving violet/emerald
CLAUDE.md described the system as "violet/emerald". Violet was the main driver of the "generated" look and clashed with semantic green. Moving to evergreen + amber gives a calmer, more credible enterprise feel and keeps green semantics distinct (success is a yellower green, brand a blue-teal). Cost: existing screenshots in help/docs show the old palette until refreshed, and anyone who liked violet can pick **Plum** or **Indigo** in Settings.
