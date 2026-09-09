/** Request body parsing for JSON and URL-encoded forms, with a size cap. */
import type { IncomingMessage } from "node:http";

const MAX_BODY_BYTES = 256 * 1024; // 256 KB

export async function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

/** Parse form/JSON body into a flat record of strings. */
export async function parseBody(
  req: IncomingMessage,
): Promise<Record<string, unknown>> {
  const raw = (await readBody(req)).toString("utf8");
  const contentType = (req.headers["content-type"] ?? "").toLowerCase();

  if (contentType.includes("application/json")) {
    try {
      const parsed = JSON.parse(raw || "{}");
      return typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  // application/x-www-form-urlencoded (default for HTML forms)
  const params = new URLSearchParams(raw);
  const out: Record<string, unknown> = {};
  for (const [key, value] of params) out[key] = value;
  return out;
}
