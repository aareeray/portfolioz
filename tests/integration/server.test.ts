import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Isolate this test run to a temp DB and deterministic secrets BEFORE importing
// modules that read config at load time.
const TMP_DB = path.resolve(process.cwd(), ".data/test-server.sqlite");
process.env.DATABASE_PATH = ".data/test-server.sqlite";
process.env.SESSION_SECRET = "test-secret-that-is-long-enough-1234567890";
process.env.ADMIN_EMAIL = "admin@test.local";
process.env.ADMIN_PASSWORD = "test-password-123";
process.env.NODE_ENV = "test";
process.env.EMAIL_PROVIDER = "console";
process.env.ANALYTICS_PROVIDER = "none";

let server: { close(cb?: () => void): void };
let base = "";

before(async () => {
  try {
    fs.rmSync(TMP_DB, { force: true });
    fs.rmSync(TMP_DB + "-journal", { force: true });
  } catch {
    /* ignore */
  }
  const { seed } = await import("../../src/data/seed.ts");
  seed();
  const { createServer } = await import("../../src/server/app.ts");
  server = createServer() as unknown as {
    close(cb?: () => void): void;
    listen: Function;
    address: Function;
  };
  await new Promise<void>((resolve) => {
    (server as any).listen(0, "127.0.0.1", () => {
      const addr = (server as any).address();
      base = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
});

after(() => {
  if (server) server.close();
});

async function extractCsrf(html: string): Promise<string> {
  const m = html.match(/name="csrf" value="([^"]+)"/);
  return m ? m[1]! : "";
}

test("home page renders with seeded content", async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  const body = await res.text();
  assert.match(body, /Huy Phan/);
  assert.match(body, /Selected work/);
});

test("GET /api/projects returns published projects", async () => {
  const res = await fetch(`${base}/api/projects`);
  assert.equal(res.status, 200);
  const data = (await res.json()) as { projects: unknown[] };
  assert.ok(Array.isArray(data.projects));
  assert.ok(data.projects.length >= 1);
});

test("GET /api/projects/:slug returns media, 404 for unknown", async () => {
  const ok = await fetch(`${base}/api/projects/dafi-tropicdane`);
  assert.equal(ok.status, 200);
  const data = (await ok.json()) as { project: { media: unknown[] } };
  assert.ok(Array.isArray(data.project.media));

  const missing = await fetch(`${base}/api/projects/does-not-exist`);
  assert.equal(missing.status, 404);
});

test("project detail page renders", async () => {
  const res = await fetch(`${base}/work/dafi-tropicdane`);
  assert.equal(res.status, 200);
  const body = await res.text();
  assert.match(body, /DAFI/);
});

test("unknown route returns 404", async () => {
  const res = await fetch(`${base}/nope`);
  assert.equal(res.status, 404);
});

test("contact: valid submission succeeds", async () => {
  const page = await (await fetch(`${base}/contact`)).text();
  const csrf = await extractCsrf(page);
  const res = await fetch(`${base}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      csrf,
      name: "Jane Tester",
      email: "jane@example.com",
      company: "Acme",
      message: "Hello, I'd like to discuss a project with you.",
    }),
  });
  assert.equal(res.status, 200);
  const data = (await res.json()) as { ok: boolean };
  assert.equal(data.ok, true);
});

test("contact: invalid submission returns 422 with issues", async () => {
  const page = await (await fetch(`${base}/contact`)).text();
  const csrf = await extractCsrf(page);
  const res = await fetch(`${base}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ csrf, name: "J", email: "bad", message: "short" }),
  });
  assert.equal(res.status, 422);
});

test("contact: bad CSRF returns 403", async () => {
  const res = await fetch(`${base}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      csrf: "nope",
      name: "Jane Tester",
      email: "jane@example.com",
      message: "Long enough message here.",
    }),
  });
  assert.equal(res.status, 403);
});

test("admin routes require auth", async () => {
  const res = await fetch(`${base}/admin`, { redirect: "manual" });
  assert.equal(res.status, 302);
});

test("admin login flow issues a session and grants access", async () => {
  const loginPage = await (await fetch(`${base}/admin/login`)).text();
  const csrf = await extractCsrf(loginPage);
  const form = new URLSearchParams({
    csrf,
    email: "admin@test.local",
    password: "test-password-123",
  });
  const login = await fetch(`${base}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    redirect: "manual",
  });
  assert.equal(login.status, 303);
  const cookie = login.headers.get("set-cookie") ?? "";
  assert.match(cookie, /pf_session=/);
  const sessionCookie = cookie.split(";")[0]!;

  const dash = await fetch(`${base}/admin`, {
    headers: { Cookie: sessionCookie },
  });
  assert.equal(dash.status, 200);
  assert.match(await dash.text(), /Dashboard/);
});

test("admin login rejects wrong password", async () => {
  const loginPage = await (await fetch(`${base}/admin/login`)).text();
  const csrf = await extractCsrf(loginPage);
  const form = new URLSearchParams({
    csrf,
    email: "admin@test.local",
    password: "wrong",
  });
  const login = await fetch(`${base}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    redirect: "manual",
  });
  assert.equal(login.status, 303);
  assert.match(login.headers.get("location") ?? "", /error=Invalid/);
});

test("security headers present", async () => {
  const res = await fetch(`${base}/`);
  assert.ok(res.headers.get("content-security-policy"));
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.equal(res.headers.get("x-frame-options"), "DENY");
});
