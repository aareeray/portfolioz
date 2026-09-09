import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  createSession,
  readSession,
  createCsrfToken,
  verifyCsrfToken,
} from "../../src/lib/auth.ts";

test("password hashing round-trips", () => {
  const hash = hashPassword("s3cret-password");
  assert.ok(hash.startsWith("scrypt$"));
  assert.equal(verifyPassword("s3cret-password", hash), true);
  assert.equal(verifyPassword("wrong", hash), false);
});

test("session sign/verify round-trips", () => {
  const token = createSession({ userId: 7, email: "a@b.co", iat: Date.now() });
  const data = readSession(token);
  assert.ok(data);
  assert.equal(data?.userId, 7);
  assert.equal(data?.email, "a@b.co");
});

test("tampered session is rejected", () => {
  const token = createSession({ userId: 1, email: "a@b.co", iat: Date.now() });
  const tampered = token.slice(0, -2) + (token.endsWith("aa") ? "bb" : "aa");
  assert.equal(readSession(tampered), null);
});

test("expired session is rejected", () => {
  const old = Date.now() - 8 * 24 * 60 * 60 * 1000;
  const token = createSession({ userId: 1, email: "a@b.co", iat: old });
  assert.equal(readSession(token), null);
});

test("csrf token binds to session and verifies", () => {
  const token = createCsrfToken("session-abc");
  assert.equal(verifyCsrfToken("session-abc", token), true);
  assert.equal(verifyCsrfToken("different", token), false);
  assert.equal(verifyCsrfToken("session-abc", "garbage"), false);
});
