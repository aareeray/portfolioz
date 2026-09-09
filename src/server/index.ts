/** Server entrypoint. Boots the HTTP server with graceful shutdown. */
import { createServer } from "./app.ts";
import { config } from "../config.ts";
import { closeDb } from "../lib/db.ts";
import { logger } from "../lib/logger.ts";

const server = createServer();

server.listen(config.port, config.host, () => {
  logger.info("server.listening", {
    url: `http://${config.host}:${config.port}`,
    env: config.env,
  });
  // Friendly console line for humans.
  process.stdout.write(
    `\n  ▲ portfolioz running at http://${config.host}:${config.port}\n\n`,
  );
});

function shutdown(signal: string): void {
  logger.info("server.shutdown", { signal });
  server.close(() => {
    closeDb();
    process.exit(0);
  });
  // Force-exit if close hangs.
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
