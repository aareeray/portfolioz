/**
 * SQLite connection using the built-in `node:sqlite` module (Node >= 22).
 * Provides a singleton `DatabaseSync` handle and a migration runner.
 */
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config.ts";
import { migrations } from "../data/migrations.ts";
import { logger } from "./logger.ts";

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;
  fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });
  db = new DatabaseSync(config.databasePath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA busy_timeout = 5000;");
  return db;
}

/** Apply any pending migrations in order. Idempotent. */
export function runMigrations(): number {
  const database = getDb();
  database.exec(
    `CREATE TABLE IF NOT EXISTS _migrations (
       id INTEGER PRIMARY KEY,
       name TEXT NOT NULL UNIQUE,
       applied_at TEXT NOT NULL DEFAULT (datetime('now'))
     );`,
  );
  const applied = new Set(
    (
      database.prepare("SELECT name FROM _migrations").all() as Array<{
        name: string;
      }>
    ).map((r) => r.name),
  );
  let count = 0;
  const insert = database.prepare("INSERT INTO _migrations (name) VALUES (?)");
  for (const migration of migrations) {
    if (applied.has(migration.name)) continue;
    database.exec("BEGIN");
    try {
      database.exec(migration.up);
      insert.run(migration.name);
      database.exec("COMMIT");
      count += 1;
      logger.info("db.migrate.applied", { name: migration.name });
    } catch (err) {
      database.exec("ROLLBACK");
      logger.error("db.migrate.failed", {
        name: migration.name,
        error: String(err),
      });
      throw err;
    }
  }
  return count;
}

/** Close the connection (used by tests / graceful shutdown). */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
