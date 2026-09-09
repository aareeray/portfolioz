/** Security headers applied to every response. */
import type { ServerResponse } from "node:http";
import { config } from "../../config.ts";

export function applySecurityHeaders(res: ServerResponse): void {
  // Content Security Policy: no third-party origins are required by this app.
  // 'unsafe-inline' is permitted for styles only (design tokens set via <style>);
  // scripts are external ES modules from 'self'.
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://framerusercontent.com",
    "img-src 'self' data: https://framerusercontent.com blob:",
    "media-src 'self' https://framerusercontent.com blob: data:",
    "font-src 'self' https://framerusercontent.com data:",
    "frame-src 'self' https://player.vimeo.com https://www.youtube.com",
    "connect-src 'self' https://framerusercontent.com blob: data:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  res.setHeader("Content-Security-Policy", csp);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  if (config.isProd) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }
}
