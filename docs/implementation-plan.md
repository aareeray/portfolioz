# Implementation Plan

Phased plan mapped onto the brief. Status is updated as work lands; final state recorded in
`docs/visual-qa.md`.

## Phase 1 — Discovery ✅
- `reference-analysis.md`, `architecture.md`, this plan.
- Decision: zero-dependency Node/TypeScript stack (registry blocked). Documented.

## Phase 2 — Foundation
- `package.json` (scripts, no runtime deps), `tsconfig.json` (strict), `.gitignore`,
  `.env.example`, `src/config.ts`.
- `node:sqlite` connection + migration runner.

## Phase 3 — Data layer
- Migrations for all tables; typed `repo.ts`; `seed.ts` with placeholder projects,
  playground items, settings, and generated SVG media.

### Schema (columns)

**projects**: id, slug (unique), title, subtitle, client, year, category, role,
description, short_description, featured (0/1), published (0/1), sort_order, hero_image,
hero_video, thumbnail_image, accent_color, external_url, case_study_url, created_at,
updated_at.

**project_media**: id, project_id (fk), type (image|video|embed|animation|rive|gallery),
src, poster, alt, caption, width, height, sort_order.

**playground_items**: id, slug (unique), title, description, type, thumbnail, media,
external_url, published, sort_order, created_at.

**contact_messages**: id, name, email, company, message, source, status
(new|read|archived), created_at.

**site_settings** (singleton id=1): site_title, description, location, timezone, email,
phone, availability, social_links (json), resume_url, showreel_url, audio_enabled (0/1),
nav_labels (json), footer_text.

**admin_users**: id, email (unique), password_hash, created_at.

## Phase 4 — Backend core
- HTTP server + router + response helpers.
- Middleware: logging, security headers, rate limiting, session.
- `validation.ts` (zod-like), `auth.ts` (scrypt + HMAC sessions + CSRF), `email.ts`,
  `analytics.ts`, helpers (`slug`, `time`, `html`, `cookies`).

## Phase 5 — Design system + public pages
- `tokens.css` (color/type/space/motion), `base.css`, `components.css`, `pages.css`.
- Layout shell, nav (desktop + mobile overlay), footer.
- Home, Work, Work/[slug], About, Playground, Contact, 404, error pages — data-driven.

## Phase 6 — Client interactions
- `motion.mjs` tokens; `cursor`, `smoothScroll`, `reveal`, `menu`, `time`, `copy`,
  `contact`, `transition`, `audio` modules. Reduced-motion + touch aware; cleanup.

## Phase 7 — APIs
- `GET /api/projects`, `/api/projects/:slug`, `/api/playground`, `/api/settings`.
- `POST /api/contact` (validation + rate limit + EmailService + persistence).

## Phase 8 — Admin CMS
- Login/logout; dashboard; project CRUD + media; playground CRUD; message triage;
  settings editor. CSRF-protected forms, auth-gated.

## Phase 9 — SEO / errors / security / a11y
- Per-page metadata + OG, `/sitemap.xml`, `/robots.txt`, JSON-LD.
- Error boundaries (route + global), graceful media fallback, experiment isolation.
- Headers, CSRF, rate limit, escaping. Keyboard nav, focus states, reduced motion, contrast.

## Phase 10 — Tests + QA
- Unit + integration tests (`node:test`).
- `typecheck`, `lint`, `build`, run server, inspect routes; write `visual-qa.md`.

## Definition of done (this environment)
All public pages exist and are data-driven; admin CRUD works; contact persists + validates;
copy-to-clipboard works; animations + reduced-motion implemented; tests/typecheck/build
pass; server boots and serves every route; deviations + approximations documented.
