/** Serve static files from /public safely (path traversal guarded). */
import fs from "node:fs";
import type { Stats } from "node:fs";
import path from "node:path";
import type { ServerResponse } from "node:http";
import { config } from "../../config.ts";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

/** Returns true if it served a file; false if not found (caller renders 404). */
export function serveStatic(urlPath: string, res: ServerResponse): boolean {
  const rel = decodeURIComponent(urlPath).replace(/^\/+/, "");
  const resolved = path.resolve(config.publicDir, rel);
  // Guard against path traversal outside publicDir.
  if (
    resolved !== config.publicDir &&
    !resolved.startsWith(config.publicDir + path.sep)
  ) {
    return false;
  }
  let stat: Stats;
  try {
    stat = fs.statSync(resolved);
  } catch {
    return false;
  }
  if (!stat.isFile()) return false;

  const ext = path.extname(resolved).toLowerCase();
  const type = MIME[ext] ?? "application/octet-stream";
  const cacheControl = config.isProd
    ? "public, max-age=31536000, immutable"
    : "no-cache";
  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": stat.size,
    "Cache-Control":
      ext === ".svg" || ext === ".css" || ext === ".mjs"
        ? config.isProd
          ? "public, max-age=3600"
          : "no-cache"
        : cacheControl,
    "Last-Modified": stat.mtime.toUTCString(),
  });
  fs.createReadStream(resolved).pipe(res);
  return true;
}
