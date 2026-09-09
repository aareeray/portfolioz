/**
 * Typed, validated environment configuration.
 * Read once at boot; never expose secrets to the client.
 */
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

try {
  process.loadEnvFile?.(path.join(ROOT, ".env"));
} catch {
  // .env is optional
}

function str(name: string, fallback?: string): string {
  const v = process.env[name];
  if (v === undefined || v === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

function int(name: string, fallback: number): number {
  const v = process.env[name];
  if (v === undefined || v === "") return fallback;
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n))
    throw new Error(`Environment variable ${name} must be an integer`);
  return n;
}

const NODE_ENV = str("NODE_ENV", "development");
const isProd = NODE_ENV === "production";

// Session secret: required in production, dev-safe default otherwise.
const sessionSecret = process.env.SESSION_SECRET?.trim();
if (isProd && (!sessionSecret || sessionSecret.length < 32)) {
  throw new Error(
    "SESSION_SECRET must be set to a random string of at least 32 chars in production",
  );
}

export const config = {
  root: ROOT,
  env: NODE_ENV,
  isProd,
  host: str("HOST", "127.0.0.1"),
  port: int("PORT", 3000),
  siteUrl: str("SITE_URL", "http://localhost:3000").replace(/\/$/, ""),
  databasePath: path.resolve(
    ROOT,
    str("DATABASE_PATH", ".data/portfolioz.sqlite"),
  ),
  sessionSecret:
    sessionSecret && sessionSecret.length >= 16
      ? sessionSecret
      : "dev-insecure-session-secret-change-me",
  admin: {
    email: str("ADMIN_EMAIL", "admin@example.com"),
    password: process.env.ADMIN_PASSWORD ?? "",
  },
  contact: {
    rateLimit: int("CONTACT_RATE_LIMIT", 5),
    rateWindowMs: int("CONTACT_RATE_WINDOW_MS", 10 * 60 * 1000),
  },
  email: {
    provider: str("EMAIL_PROVIDER", "console") as "console" | "resend",
    from: str("EMAIL_FROM", "hello@example.com"),
    to: str("EMAIL_TO", "hello@example.com"),
    resendApiKey: process.env.RESEND_API_KEY ?? "",
  },
  analytics: {
    provider: str("ANALYTICS_PROVIDER", "log") as "none" | "log",
  },
  publicDir: path.join(ROOT, "public"),
} as const;

export type Config = typeof config;
