/**
 * Application factory. Builds the router, wires middleware, and returns an
 * http.Server. Exported separately from index.ts so tests can start it on an
 * ephemeral port.
 */
import http from "node:http";
import type { IncomingMessage, ServerResponse, Server } from "node:http";
import { config } from "../config.ts";
import { runMigrations } from "../lib/db.ts";
import { logger } from "../lib/logger.ts";
import { Router } from "./router.ts";
import type { RequestContext } from "./router.ts";
import { applySecurityHeaders } from "./middleware/security.ts";
import { startRequestLog } from "./middleware/requestLog.ts";
import { RateLimiter } from "./middleware/rateLimit.ts";
import { parseCookies } from "../lib/cookies.ts";
import { readSession, SESSION_COOKIE } from "../lib/auth.ts";
import { serveStatic } from "./handlers/assets.ts";
import { sendHtml, sendJson } from "./respond.ts";
import { renderError } from "../views/error.ts";
import { registerPageRoutes } from "./handlers/pages.ts";
import { registerApiRoutes } from "./handlers/api.ts";
import { registerAdminRoutes } from "./handlers/admin.ts";

export interface AppDeps {
  contactLimiter: RateLimiter;
}

export function buildRouter(deps: AppDeps): Router {
  const router = new Router();
  registerPageRoutes(router);
  registerApiRoutes(router, deps);
  registerAdminRoutes(router);
  return router;
}

export function createServer(): Server {
  runMigrations();

  const contactLimiter = new RateLimiter(
    config.contact.rateLimit,
    config.contact.rateWindowMs,
  );
  const loginLimiter = new RateLimiter(10, 5 * 60 * 1000);
  // Periodically sweep limiter memory.
  const sweeper = setInterval(() => {
    contactLimiter.sweep();
    loginLimiter.sweep();
  }, 60_000);
  sweeper.unref();

  const router = buildRouter({ contactLimiter });

  const server = http.createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      const requestId = startRequestLog(req, res);
      applySecurityHeaders(res);

      try {
        const url = new URL(req.url ?? "/", config.siteUrl);
        const method = req.method ?? "GET";
        let pathname = url.pathname;
        if (pathname.length > 1 && pathname.endsWith("/"))
          pathname = pathname.replace(/\/+$/, "");

        // Static assets (anything with a file extension under known dirs).
        if (method === "GET" && /\.[a-z0-9]+$/i.test(pathname)) {
          if (serveStatic(pathname, res)) return;
        }

        const cookies = parseCookies(req.headers.cookie);
        const sessionToken = cookies[SESSION_COOKIE] ?? "";
        const session = readSession(sessionToken);

        const match = router.match(method, pathname);
        if (!match) {
          // Method fallback: try GET match to distinguish 404 vs 405 (kept simple → 404).
          renderNotFound(req, res, session);
          return;
        }

        const ctx: RequestContext = {
          req,
          res,
          method,
          path: pathname,
          query: url.searchParams,
          params: match.params,
          url,
          cookies,
          session,
          sessionToken,
          requestId,
          ip: clientIp(req),
        };

        await match.handler(ctx);
      } catch (err) {
        logger.error("http.unhandled", {
          requestId,
          error: err instanceof Error ? err.stack : String(err),
        });
        if (!res.headersSent) {
          const wantsJson =
            (req.headers.accept ?? "").includes("application/json") ||
            (req.url ?? "").startsWith("/api");
          if (wantsJson)
            sendJson(res, { error: { message: "Internal Server Error" } }, 500);
          else
            sendHtml(
              res,
              renderError(500, "Something went wrong on our end."),
              500,
            );
        } else {
          res.end();
        }
      }
    },
  );

  server.on("close", () => clearInterval(sweeper));
  return server;
}

function renderNotFound(
  req: IncomingMessage,
  res: ServerResponse,
  session: unknown,
): void {
  const wantsJson =
    (req.headers.accept ?? "").includes("application/json") ||
    (req.url ?? "").startsWith("/api");
  if (wantsJson) {
    sendJson(res, { error: { message: "Not Found" } }, 404);
    return;
  }
  sendHtml(
    res,
    renderError(
      404,
      "The page you're looking for doesn't exist.",
      Boolean(session),
    ),
    404,
  );
}

function clientIp(req: IncomingMessage): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0)
    return fwd.split(",")[0]!.trim();
  return req.socket.remoteAddress ?? "unknown";
}
