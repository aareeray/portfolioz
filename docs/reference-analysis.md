# Reference Analysis — `huyml.co`

> **Important constraint.** This project was built inside a sandboxed environment with
> **no outbound network access to `huyml.co`** (requests return `HTTP 403` at the egress
> proxy) and **no access to the npm registry**. The reference site therefore could **not**
> be crawled, and its DOM/CSS/asset/animation internals could not be measured directly.
>
> This document is a *behavioural* reconstruction based on:
> - public search metadata about the site (owner, positioning, focus),
> - the well-established conventions of award-winning minimal creative/interaction-design
>   portfolios (the genre `huyml.co` belongs to),
> - the explicit build brief.
>
> Every item that could not be confirmed is flagged **(APPROX)**. No proprietary assets,
> fonts, copy, video, illustrations, or Rive files from the original were downloaded or
> reproduced. All content in this recreation is self-authored placeholder material.

## 0. What we know about the reference

- **Owner:** Huy Phan (a.k.a. Huy Nguyen / "by-huy"), an independent designer based in
  Vietnam, focused on **website, mobile, and interaction design**. Positioned as an
  award-winning designer.
- **Genre:** single-author creative portfolio — editorial, media-forward, motion-rich,
  restrained palette. Think Awwwards "Site of the Day" conventions rather than a SaaS or
  agency template.

## 1. Page inventory

| Route | Purpose | Confidence |
| --- | --- | --- |
| `/` | Editorial hero + selected work + ambient details (time/location) | High |
| `/work` | Full index of selected projects | High |
| `/work/[slug]` | Data-driven case study | High |
| `/about` | Bio, capabilities, process, clients, contact CTA | High |
| `/playground` | Experiments / motion studies / loops | Medium |
| `/contact` | Headline, email (copy-to-clipboard), form, socials, availability | High |
| `/404` | Not-found | High |
| `/admin/*` | CMS (not part of the public reference; required by the brief) | N/A |

## 2. Section inventory (per page)

**Home** — sticky/floating minimal header · oversized editorial hero with animated text
reveal · live local time + location label · selected-work list with large media and hover
choreography · footer. **(APPROX on exact section order)**

**Work** — index list/grid of projects; each row/card reveals on scroll; hover scales the
media and shifts metadata. Category + year metadata visible.

**Project detail** — hero media → intro → meta (client/year/role/category) → body copy
interleaved with media → gallery → outcome → "next project" navigation.

**About** — intro statement · biography · capabilities list · experience · process steps
(expandable/indexed) · selected clients · contact CTA.

**Playground** — independent experiment tiles (video loops, canvas, hover toys), each
isolated so one failure can't take down the page.

**Contact** — large headline · email with copy affordance · form (name/email/company/
message) · socials · location · availability · success/error states.

## 3. Component inventory

Navigation (desktop + mobile overlay), Logo/wordmark, LiveTime, LocationLabel, Cursor
(custom, multi-state), SmoothScroll wrapper, Reveal (scroll-triggered), MediaReveal,
ProjectCard, ProjectList, ProjectHero/Intro/Meta/Media/Gallery/Next, ProcessList,
CapabilityList, ClientList, ContactForm, CopyEmail, SocialLinks, Footer, PageTransition,
Showreel/Video, AudioToggle.

## 4. Animation inventory

| Interaction | Reconstructed behaviour | Confidence |
| --- | --- | --- |
| Page load | Fast, staggered text/line reveal in hero | (APPROX) |
| Scroll reveal | Elements fade + rise ~16–24px as they enter viewport, staggered | (APPROX) |
| Smooth scroll | Inertial wheel smoothing (Lenis-like), touch passthrough | High (genre) |
| Custom cursor | Interpolated dot/ring; state changes on hover/link/media | High (genre) |
| Project hover | Media scale ~1.03–1.06, subtle metadata shift, cursor "view" label | (APPROX) |
| Page transition | Short cover/fade between routes (~0.4–0.6s), no long theatrics | (APPROX) |
| Text reveal | Line-masked upward reveal | (APPROX) |
| Live time | Updates once per second in an isolated component only | High |

Timing tokens chosen (documented, not measured): fast `0.2s`, normal `0.45s`, slow `0.8s`;
primary easing an "expo-out"-style `cubic-bezier(0.16, 1, 0.3, 1)`.

## 5. Responsive behaviour inventory

- Custom cursor disabled on touch / coarse pointers.
- Desktop multi-column work layout collapses to a single editorial column on mobile.
- Fluid typography via `clamp()`; hero shrinks intentionally, not by uniform scaling.
- Mobile navigation becomes a full-screen overlay menu with focus trapping + Esc to close.
- Media aspect ratios adapt (wide hero → taller crop on narrow screens). **(APPROX)**

## 6. Content / data inventory

Projects (slug, title, subtitle, client, year, category, role, descriptions, featured,
published, order, hero image/video, thumbnail, accent color, external/case-study URLs,
media list). Playground items. Site settings (title, description, location, timezone,
email, availability, socials, showreel, footer). Contact messages.

All seed content is **placeholder** ("Northlight", "Meridian", etc.) — deliberately not the
reference's real projects.

## 7. Technical implementation assumptions

The reference is (almost certainly) a JS-framework SPA/SSG with GSAP/Framer + a Lenis-style
smooth-scroll and a headless CMS. **We cannot use that stack here** (registry blocked), so
the recreation uses server-rendered HTML from a zero-dependency Node/TypeScript server with
`node:sqlite`, progressively enhanced by vanilla ES modules. See `architecture.md` for the
full rationale and the migration path to Next.js/Prisma.

## 8. Uncertain behaviours (assumptions made, documented)

- Exact easing curves, durations, and stagger offsets — approximated to genre norms.
- Whether the reference uses audio; we implement an accessible, non-autoplaying toggle.
- Whether a Rive asset exists; we ship a lightweight self-made SVG/canvas placeholder behind
  a `RiveScene`-style abstraction instead of any proprietary Rive file.
- Exact grid column counts and container max-widths — approximated (`~1440px` content max).

## 9. Items requiring visual approximation

Typography (family, exact scale, tracking), color values, precise spacing rhythm, image
crops/ratios, and all motion timing are **approximations** because the source could not be
measured. They are encoded as design tokens (`public/styles/tokens.css`) so they can be
tuned in one place once real reference measurements are available. Tracked in
`docs/visual-qa.md`.
