# Visual QA

Findings from the build-and-review cycles, the changes made, and the known differences from
the reference. Because the sandbox **cannot reach `https://huyml.co/`** (HTTP 403 at the
egress proxy) and **cannot render a headless browser against arbitrary layouts here**, visual
comparison was done against the *documented behaviour of the genre* (see
`reference-analysis.md`), not against live pixels. Where a value is a deliberate
approximation it is called out and encoded as a token so it can be tuned in one place.

## Environment constraints (context for every finding below)

1. **No network to the reference** — typography family/scale, exact color values, spacing
   rhythm, image crops, and motion timing are approximations, not measurements.
2. **No npm registry** — mandated stack unavailable; built on Node built-ins (documented in
   `architecture.md`). This does not affect visual output but explains the implementation.
3. **No live preview in-sandbox** — responsive checks were reasoned from the CSS
   (breakpoints, `clamp()` scales, grid rules) and verified by rendering HTML and inspecting
   markup/asset delivery via HTTP, not by screenshotting each viewport.

## Verification actually performed

- **Routes**: every public route returns `200`, `/nope` → `404`, `/admin` → `302`,
  `/admin/login` → `200`; static CSS/JS/SVG and `sitemap.xml`/`robots.txt` serve correctly.
- **Content**: home renders hero, live-clock nodes, seeded project titles; project detail
  renders hero + gallery media; contact renders the form with a CSRF token.
- **Behaviour**: contact API accepts valid input (`200`), rejects invalid (`422` with
  per-field issues) and bad CSRF (`403`); admin login issues a session and gates
  `/admin/*`; wrong password is rejected; security headers present.
- **Quality gates**: `tsc --noEmit` clean, Prettier check clean, `node --test` 38/38 pass,
  `npm run build` OK.

## Fix order followed (per brief: geometry → type → spacing → imagery → interaction → motion → micro)

1. **Geometry** — container max (`--container-max: 1440px`), fluid gutters, section rhythm
   (`--section-y`), and page-specific grids (work list/grid, project meta 4-col, about bio
   2-col, contact 2-col) established first.
2. **Typography** — token scale with `clamp()` (`--text-hero` → `--text-xs`), serif display
   / sans body, tight tracking on display. One source of truth in `tokens.css`.
3. **Spacing** — single spacing scale + section/gutter tokens; no scattered magic numbers.
4. **Imagery** — `SmartImage` sets aspect-ratio to prevent layout shift; media clip-reveal;
   generated SVG covers per project.
5. **Interaction** — custom cursor states, hover underlines, magnetic playground hover,
   copy-email, mobile menu.
6. **Animation** — centralized `motion.mjs` tokens/easings; scroll reveals, hero line
   reveal, page transitions; intentionally restrained (no dramatic over-animation).
7. **Micro-details** — arrow-link nudge, cursor label, audio bars, focus states.

## Responsive review (reasoned from CSS)

| Width | Composition intent | Notes |
| --- | --- | --- |
| 375 / 390 / 430 | Single-column editorial; nav → overlay menu; media ratios widen; hero meta stacks | `@media (max-width: 720px)` |
| 768 | 2-col footer, single-col about/contact, 2-col playground | `@media (max-width: 1024px)` |
| 1024 | Transitional; capabilities/contact collapse | same breakpoint |
| 1280 / 1440 | Full multi-column layout; content capped at 1440 | base tokens |
| 1920+ | Centered within `--container-max`; generous gutters | intentional, not stretched |

Mobile is an intentional recomposition (menu overlay, stacked meta, adjusted ratios), not a
scaled-down desktop. Custom cursor and smooth scroll disable on touch/coarse pointers.

## Accessibility

- Skip link; semantic landmarks (`header`/`main`/`footer`/`nav`); logical headings.
- Visible `:focus-visible` styles; mobile menu traps focus and closes on Esc; restores focus.
- All animation gated behind `prefers-reduced-motion` (reveals show immediately; page
  transition + custom cursor + smooth scroll disabled).
- Form labels, `aria-live` status, honeypot for spam; hover-only info (project links) also
  reachable via real anchors.
- Audio never autoplays; toggle is keyboard-operable with `aria-pressed`.

## Performance

- Server-rendered HTML; JS is progressive enhancement (site works without it).
- Images lazy by default, dimensioned to avoid CLS; videos lazy-loaded via
  IntersectionObserver and only then fetched.
- Animations use `transform`/`opacity`; `will-change` used sparingly; observers and RAF
  loops are disconnected/cancelled on unload (see module teardown + `main.mjs` `pagehide`).
- Rate-limiter memory is swept on an interval; the sweep timer is `unref`'d.

## Known differences from the reference (approximations)

These are the honest gaps, all traceable to "could not measure the source":

1. **Typography** — family and exact scale/tracking are approximations (system serif +
   system sans). Swap `--font-display`/`--font-body` and the `--text-*` clamps to match once
   real values are known. No proprietary font is bundled.
2. **Color** — the warm dark palette is a plausible reconstruction, not sampled values.
3. **Motion timing** — durations (`0.2 / 0.45 / 0.8s`) and the expo-out easing are
   genre-typical guesses; stagger offsets (~90ms) likewise. Tune in `tokens.css` +
   `motion.mjs`.
4. **Exact section order & copy** — information architecture matches the genre; wording and
   project content are original placeholders, deliberately not the reference's.
5. **Media** — generated SVG stand-ins, not the reference's photography/video/Rive.
6. **Smooth-scroll feel** — a lightweight hand-rolled inertia (Lenis-like), not Lenis
   itself; the coefficient (`0.12`) approximates a premium feel.
7. **Rive** — represented by a `RiveScene`-style abstraction concept + SVG placeholder; no
   proprietary Rive runtime/asset is used.

## Remaining approximations to revisit with real reference access

- Measure and set: display font, hero size ramp, tracking, line-heights; palette hex values;
  container max + gutter at each breakpoint; project media aspect ratios; transition/stagger
  durations and easing. All are centralized as tokens for a fast tuning pass.

## Re-run the checks

```bash
npm run typecheck && npm run lint && npm test && npm run build
npm run db:seed && npm run dev   # then inspect routes in a browser
```
