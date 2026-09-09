# Architecture

## Context: why not Next.js / React / Prisma / GSAP?

The brief mandates Next.js + React + TypeScript + Prisma + PostgreSQL + Framer Motion +
GSAP + Lenis. Inside this build environment the **npm registry is unreachable** (the egress
proxy returns `403` for `registry.npmjs.org`; corepack and offline installs also fail). No
package from that stack can be installed, so a framework build is impossible **here**.

Rather than ship a project that cannot run, this repository is implemented with a
**zero-runtime-dependency TypeScript stack on Node's built-ins**, which the sandbox fully
supports and which we can verify end-to-end:

- **Runtime:** Node ≥ 22, executed natively as TypeScript (`--experimental-strip-types`),
  no bundler/transpile step required.
- **HTTP:** the built-in `node:http` server with a small hand-written router.
- **Database:** the built-in `node:sqlite` (`DatabaseSync`) — a real embedded SQL DB with
  migrations and a seed script.
- **Rendering:** server-rendered HTML produced by typed template functions (server-first,
  minimal client JS), progressively enhanced by **vanilla ES modules** for motion.
- **Validation:** a small Zod-style schema library (`src/lib/validation.ts`).
- **Auth:** HMAC-signed, httpOnly session cookies (`src/lib/auth.ts`).
- **Tests:** the built-in `node:test` runner.

The domain layer (`src/data`, `src/lib/db.ts`) is deliberately isolated behind repository
functions (`getProjectBySlug`, `listProjects`, …) so the persistence layer can be swapped
for **Prisma + PostgreSQL** without touching view or handler code. See the "Migration path"
section. This satisfies the brief's real intent — a data-driven, CMS-backed, animated,
accessible portfolio — with the only technology that can execute in this environment.

## High-level shape

```
Browser ──HTTP──▶ node:http server (src/server)
                     │
                     ├─ middleware: request-id/logging, security headers,
                     │              rate-limit, session
                     ├─ router: method + path → handler
                     ├─ handlers/pages   → views/* (server-rendered HTML)
                     ├─ handlers/api     → JSON (projects, playground, settings, contact)
                     └─ handlers/admin   → CMS pages + form posts (auth-gated)
                     │
                     ▼
              repositories (src/data/repo.ts)
                     │
                     ▼
              node:sqlite (src/lib/db.ts)  ── migrations, seed
```

Client enhancement layer (`public/js/*.mjs`): custom cursor, smooth scroll, scroll reveals,
mobile menu, live time, copy-to-clipboard, contact form, page transitions, audio toggle —
each an independent module, feature-detected, reduced-motion aware, with teardown.

## Directory layout

```
portfolioz/
  package.json            scripts only; zero runtime deps (devDeps declared for CI machines)
  tsconfig.json
  .env.example
  README.md
  docs/                   reference-analysis · architecture · implementation-plan · visual-qa
  scripts/                migrate.ts · seed.ts · build.ts
  src/
    config.ts             env parsing (typed, validated)
    server/
      index.ts            bootstrap + graceful shutdown
      app.ts              server factory (used by tests too)
      router.ts           tiny router with params
      respond.ts          response helpers (html/json/redirect/errors)
      middleware/         logger · security · rateLimit · session
      handlers/           pages · api · admin · assets
    lib/
      db.ts               node:sqlite connection + migrations runner
      validation.ts       zod-like validator
      auth.ts             session sign/verify, password hashing (scrypt), CSRF
      email.ts            EmailService abstraction (console/Resend-ready)
      analytics.ts        event abstraction
      slug.ts · time.ts · html.ts · cookies.ts · result.ts
    data/
      migrations.ts       ordered SQL migrations
      repo.ts             typed repository functions
      seed.ts             placeholder content + generated SVG media
    views/
      layout.ts           <html> shell, <head>, nav, footer, script/style tags
      home.ts work.ts project.ts about.ts playground.ts contact.ts notfound.ts error.ts
      admin/              login · dashboard · projects · playground · messages · settings
      components/         nav · footer · projectCard · meta · reveal · icons
    types/index.ts
  public/
    styles/               tokens.css · base.css · components.css · pages.css
    js/                   main.mjs + cursor/scroll/reveal/menu/time/copy/contact/transition/audio
    media/                self-authored SVG placeholders (og, posters, textures)
    fonts/                (system font stack; no proprietary fonts bundled)
  tests/
    unit/                 validation · slug · time · clipboard · auth
    integration/          projects-api · contact-api · admin-auth
```

## Server/client boundary

- **Server-first.** All content pages are fully rendered as HTML with real data; they work
  with JavaScript disabled (progressive enhancement). This mirrors the brief's "prefer
  server components; don't make the whole page a client component."
- **Client JS is additive.** Motion, cursor, smooth scroll, and clipboard are enhancements
  layered on top; disabling them degrades gracefully.

## Request lifecycle

1. `logger` assigns a request id, records method/path/status/duration.
2. `security` sets CSP, `X-Content-Type-Options`, `Referrer-Policy`, frame options, etc.
3. `rateLimit` (token bucket, in-memory) guards mutating/public-write endpoints.
4. `session` parses the signed cookie → `req.session`.
5. `router` matches and dispatches; handlers use `repo` + `views`.
6. Errors flow to a central handler → typed JSON (API) or the error page (HTML).

## Data model

Tables: `projects`, `project_media`, `playground_items`, `contact_messages`,
`site_settings` (singleton row), `admin_users`. Full column list in
`docs/implementation-plan.md` and `src/data/migrations.ts`.

## Motion architecture

`public/js/motion.mjs` centralises tokens (`fast/normal/slow`) and easings; all modules
import from it. No duplicated magic numbers. Everything checks
`matchMedia('(prefers-reduced-motion: reduce)')` and coarse-pointer/touch before animating.

## Security

Server-only secrets via env; scrypt password hashing; HMAC-signed httpOnly/SameSite session
cookies; per-form CSRF tokens for admin mutations; input validation on every write;
rate limiting on the public contact endpoint; strict security headers; safe HTML escaping in
all templates (`src/lib/html.ts`). No DB access from the client. `.env.example` documents
every variable; no secrets committed.

## Migration path to the mandated stack

- `src/data/repo.ts` is the single seam. Re-implement each function with Prisma Client and
  the rest of the app is unchanged.
- `src/data/migrations.ts` maps 1:1 to a `schema.prisma` (types annotated inline).
- Views are pure functions returning HTML strings → straightforward to port to React
  Server Components; the vanilla motion modules map to Framer Motion / GSAP / Lenis.
- `EmailService` and `analytics` are already provider abstractions (Resend/Postmark, etc.).

This is documented as the intended production target; the in-repo implementation is the
runnable, verifiable equivalent for this environment.
