/**
 * Authentication primitives (zero dependencies, node:crypto only):
 *  - password hashing with scrypt + random salt
 *  - stateless signed sessions (HMAC-SHA256 over a compact payload)
 *  - CSRF tokens tied to the session secret
 */
import crypto from "node:crypto";
import { config } from "../config.ts";

const KEYLEN = 64;

/** Hash a password: returns `scrypt$<saltHex>$<hashHex>`. */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, KEYLEN);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

/** Constant-time password verification. */
export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1]!, "hex");
  const expected = Buffer.from(parts[2]!, "hex");
  const derived = crypto.scryptSync(password, salt, expected.length);
  return (
    expected.length === derived.length &&
    crypto.timingSafeEqual(expected, derived)
  );
}

export interface SessionData {
  userId: number;
  email: string;
  /** issued-at (ms) */
  iat: number;
}

function sign(payload: string): string {
  return crypto
    .createHmac("sha256", config.sessionSecret)
    .update(payload)
    .digest("base64url");
}

/** Encode a session into a signed cookie value: `<payloadB64>.<sig>`. */
export function createSession(data: SessionData): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

const MAX_SESSION_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Verify + decode a session cookie; returns null when invalid or expired. */
export function readSession(token: string | undefined): SessionData | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(payload);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))
    return null;
  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as SessionData;
    if (typeof data.userId !== "number" || typeof data.iat !== "number")
      return null;
    if (Date.now() - data.iat > MAX_SESSION_AGE_MS) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * CSRF token bound to a session identifier (here we bind to the signed session
 * cookie value). Double-submit pattern: token embedded in the form must match.
 */
export function createCsrfToken(sessionToken: string): string {
  return crypto
    .createHmac("sha256", config.sessionSecret)
    .update(`csrf:${sessionToken}`)
    .digest("base64url");
}

export function verifyCsrfToken(
  sessionToken: string,
  token: string | undefined,
): boolean {
  if (!token) return false;
  const expected = createCsrfToken(sessionToken);
  if (token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export const SESSION_COOKIE = "pf_session";
