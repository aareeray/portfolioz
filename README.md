# portfolioz

A high-fidelity recreation of the **experience and behaviour** of an award-winning minimal
creative portfolio (reference: `https://huyml.co/`), built as a **production-grade,
zero-runtime-dependency full-stack TypeScript application** on Node's built-ins.

> **Why not Next.js / React / Prisma?** The reference brief specifies that stack. This
> repository was authored in a sandbox where **the npm registry is unreachable**, so no
> third-party package (Next, React, Prisma, Framer Motion, GSAP, Lenis, …) could be
> installed. Rather than ship something that can't run, the app is implemented on Node
> built-ins — `node:http`, `node:sqlite`, native TypeScript execution, `node:test` — which
> deliver the same product surface (data-driven pages, a CMS, motion, accessibility) and can
> be fully verified. The data layer is isolated behind repository functions so it can be
> ported to Prisma/PostgreSQL without touching views or handlers. See
> [`docs/architecture.md`](docs/architecture.md) for the full rationale and migration path,
> and [`docs/reference-analysis.md`](docs/reference-analysis.md) for the behavioural
> reverse-engineering (the site could not be crawled from the sandbox; approximations are
> documented). **All content and media are self-authored placeholders** — no proprietary
> assets, fonts, copy, or media from the reference are used.

## Features

- **Public site** — Home, Work index, data-driven Project detail (`/work/[slug]`), About
  (bio, capabilities, expandable process, clients), Playground (error-isolated experiments),
  Contact (form + copy-to-clipboard), plus `404`, `/privacy`, `/terms`.
- **Backend** — `node:http` server, tiny router, middleware (request logging, security
  headers, token-bucket rate limiting, signed sessions), JSON APIs, `node:sqlite` with
  migrations + seed.
- **Admin CMS** (`/admin`) — session auth; CRUD for projects (+ media), playground, contact
  message triage, and site settings. CSRF-protected forms.
- **Motion & interaction** (vanilla ES modules) — custom cursor, inertial smooth scroll,
  scroll reveals, mobile overlay menu (focus-trapped, Esc-to-close), live local time,
  copy-email, cinematic page transitions, ambient audio toggle, magnetic hover experiments.
  All reduced-motion and touch aware, with teardown on unload.
- **Quality** — TypeScript strict mode, SEO (metadata, OG, `sitemap.xml`, `robots.txt`,
  JSON-LD), WCAG-minded accessibility, security headers + CSRF + rate limiting, and tests.

## Requirements

- **Node.js ≥ 22.5** (uses stable-ish `node:sqlite` and native TypeScript execution).
  No database server needed for local development — SQLite is embedded.

## Quick start

```bash
npm install          # installs devDeps (typescript, prettier, @types/node) on a normal machine
cp .env.example .env # then edit values (see below)
npm run db:seed      # create + seed the SQLite DB and generate placeholder media
npm run dev          # start the dev server (watch mode) at http://localhost:3000
```

Open http://localhost:3000. Admin is at http://localhost:3000/admin.

> **Sandbox note:** if your environment injects a `NODE_OPTIONS` preload that breaks Node
> CLIs, prefix commands with `env -u NODE_OPTIONS`. This is not needed on a normal machine.

## Environment variables

Copy `.env.example` → `.env`. Key variables:

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT`, `HOST` | Server bind | `3000`, `127.0.0.1` |
| `SITE_URL` | Canonical/OG/sitemap base | `http://localhost:3000` |
| `DATABASE_PATH` | SQLite file | `.data/portfolioz.sqlite` |
| `SESSION_SECRET` | Signs session cookies (**required, ≥32 chars, in prod**) | dev fallback |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin bootstrap (seed only) | `admin@example.com` / dev fallback |
| `CONTACT_RATE_LIMIT`, `CONTACT_RATE_WINDOW_MS` | Contact throttling | `5` / `600000` |
| `EMAIL_PROVIDER` | `console` or `resend` | `console` |
| `EMAIL_FROM`, `EMAIL_TO`, `RESEND_API_KEY` | Email delivery | — |
| `ANALYTICS_PROVIDER` | `none` or `log` | `log` |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server (watch mode) |
| `npm start` | Production server |
| `npm run build` | Typecheck + asset verification (no bundler — Node runs TS natively) |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | Prettier format check |
| `npm run format` | Prettier write |
| `npm test` | Unit + integration tests (`node:test`) |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Reset + seed content and generate media |

## Database & seeding

Schema lives in [`src/data/migrations.ts`](src/data/migrations.ts) (maps 1:1 to a Prisma
model — see architecture doc). Migrations apply automatically on boot and via
`npm run db:migrate`. `npm run db:seed` clears content tables, inserts 6 placeholder
projects (with generated SVG media), 6 playground items, default site settings, and the
first admin user.

## Admin access

- The **first admin** is created by `npm run db:seed` from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- If `ADMIN_PASSWORD` is unset in development, the seed creates a **dev fallback**:
  `admin@example.com` / `admin1234` (logged with a warning). **Set a strong
  `ADMIN_PASSWORD` for anything real** — never rely on the fallback in production.
- Sessions are HMAC-signed httpOnly cookies; admin form posts are CSRF-protected.

## Media management

Projects and playground items reference media by URL. In development, `npm run db:seed`
generates self-authored SVGs into `public/media`. Via the CMS you can add/remove media on a
project and point `heroImage`/`thumbnail`/media `src` at any URL. To wire a real storage
provider (Cloudinary / S3 / Uploadcare), implement an uploader and store the returned URL —
the rendering layer only needs a URL.

## Testing

```bash
npm test
```

Covers: validation, slug, time, auth (hashing/sessions/CSRF), HTML escaping (unit); and the
project API, contact submission (valid/invalid/CSRF), 404s, admin auth flow, and security
headers (integration, against a live server on an ephemeral port with a temp DB).

## Production build & deployment

```bash
npm run build            # typecheck + verify
NODE_ENV=production SESSION_SECRET=... npm start
```

- **App/server:** any Node ≥ 22 host (Fly, Render, a VM, or Vercel with an adapter). Set
  `NODE_ENV=production`, a strong `SESSION_SECRET`, and `SITE_URL`.
- **Database:** SQLite works for single-instance deploys. For multi-instance/managed
  Postgres, follow the migration path in [`docs/architecture.md`](docs/architecture.md)
  (re-implement `src/data/repo.ts` with Prisma; `DATABASE_URL` is already stubbed in
  `.env.example`).
- **Email:** set `EMAIL_PROVIDER=resend` + `RESEND_API_KEY` (needs runtime network).

## Project structure

See [`docs/architecture.md`](docs/architecture.md). In short: `src/server` (HTTP, routing,
middleware, handlers), `src/views` (server-rendered HTML), `src/data` (migrations, repo,
seed), `src/lib` (db, auth, validation, email, analytics, helpers), `public` (CSS, ES module
enhancements, generated media), `tests`, `docs`.

## Documentation

- [`docs/reference-analysis.md`](docs/reference-analysis.md) — behavioural reverse-engineering + approximations
- [`docs/architecture.md`](docs/architecture.md) — stack decision, structure, migration path
- [`docs/implementation-plan.md`](docs/implementation-plan.md) — phased plan + schema
- [`docs/visual-qa.md`](docs/visual-qa.md) — QA findings, changes, known differences

## License

MIT. This is a study recreation of an *experience*, not a copy of the reference site's code
or assets.
