/** Per-request logging with a generated request id and duration. */
import type { IncomingMessage, ServerResponse } from "node:http";
import crypto from "node:crypto";
import { logger } from "../../lib/logger.ts";

export function startRequestLog(
  req: IncomingMessage,
  res: ServerResponse,
): string {
  const requestId = crypto.randomUUID();
  const start = process.hrtime.bigint();
  res.setHeader("X-Request-Id", requestId);
  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    logger.info("http.request", {
      requestId,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    });
  });
  return requestId;
}
