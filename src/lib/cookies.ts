/** Cookie parsing and serialization (no dependencies). */

export function parseCookies(
  header: string | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(val);
    } catch {
      out[key] = val;
    }
  }
  return out;
}

export interface CookieOptions {
  maxAge?: number; // seconds
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  expires?: Date;
}

export function serializeCookie(
  name: string,
  value: string,
  opts: CookieOptions = {},
): string {
  const segments = [`${name}=${encodeURIComponent(value)}`];
  segments.push(`Path=${opts.path ?? "/"}`);
  if (opts.maxAge !== undefined)
    segments.push(`Max-Age=${Math.floor(opts.maxAge)}`);
  if (opts.expires) segments.push(`Expires=${opts.expires.toUTCString()}`);
  if (opts.httpOnly) segments.push("HttpOnly");
  if (opts.secure) segments.push("Secure");
  segments.push(`SameSite=${opts.sameSite ?? "Lax"}`);
  return segments.join("; ");
}
