/** A tiny method + path router with `:param` support. */
import type { IncomingMessage, ServerResponse } from "node:http";
import type { SessionData } from "../lib/auth.ts";

export interface RequestContext {
  req: IncomingMessage;
  res: ServerResponse;
  method: string;
  path: string;
  query: URLSearchParams;
  params: Record<string, string>;
  url: URL;
  cookies: Record<string, string>;
  session: SessionData | null;
  /** signed session cookie value (for CSRF binding), or "" when absent */
  sessionToken: string;
  requestId: string;
  ip: string;
}

export type Handler = (ctx: RequestContext) => void | Promise<void>;

interface Route {
  method: string;
  segments: string[];
  handler: Handler;
}

export class Router {
  private routes: Route[] = [];

  add(method: string, pattern: string, handler: Handler): void {
    this.routes.push({ method, segments: split(pattern), handler });
  }

  get(pattern: string, handler: Handler): void {
    this.add("GET", pattern, handler);
  }
  post(pattern: string, handler: Handler): void {
    this.add("POST", pattern, handler);
  }

  match(
    method: string,
    path: string,
  ): { handler: Handler; params: Record<string, string> } | null {
    const parts = split(path);
    for (const route of this.routes) {
      if (route.method !== method) continue;
      const params = matchSegments(route.segments, parts);
      if (params) return { handler: route.handler, params };
    }
    return null;
  }
}

function split(p: string): string[] {
  return p.split("/").filter(Boolean);
}

function matchSegments(
  pattern: string[],
  actual: string[],
): Record<string, string> | null {
  if (pattern.length !== actual.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pattern.length; i += 1) {
    const seg = pattern[i]!;
    const act = actual[i]!;
    if (seg.startsWith(":")) {
      params[seg.slice(1)] = decodeURIComponent(act);
    } else if (seg !== act) {
      return null;
    }
  }
  return params;
}
