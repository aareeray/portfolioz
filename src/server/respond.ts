/** Response helpers wrapping node:http ServerResponse. */
import type { ServerResponse } from "node:http";
import type { RawHtml } from "../lib/html.ts";

export function sendHtml(
  res: ServerResponse,
  body: string | RawHtml,
  status = 200,
): void {
  const html = typeof body === "string" ? body : body.value;
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": Buffer.byteLength(html),
  });
  res.end(html);
}

export function sendJson(
  res: ServerResponse,
  data: unknown,
  status = 200,
): void {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

export function sendText(
  res: ServerResponse,
  body: string,
  status = 200,
  contentType = "text/plain; charset=utf-8",
): void {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

export function redirect(
  res: ServerResponse,
  location: string,
  status = 302,
): void {
  res.writeHead(status, { Location: location });
  res.end();
}

export function apiError(
  res: ServerResponse,
  status: number,
  message: string,
  issues?: unknown,
): void {
  sendJson(res, { error: { message, ...(issues ? { issues } : {}) } }, status);
}
