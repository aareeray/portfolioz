/**
 * Ordered SQL migrations. Each maps 1:1 to a Prisma model (see docs/architecture.md
 * "Migration path"). Applied on boot and via `npm run db:migrate`.
 */

export interface Migration {
  name: string;
  up: string;
}

export const migrations: Migration[] = [
  {
    name: "0001_init",
    up: `
      CREATE TABLE projects (
        id                INTEGER PRIMARY KEY AUTOINCREMENT,
        slug              TEXT NOT NULL UNIQUE,
        title             TEXT NOT NULL,
        subtitle          TEXT,
        client            TEXT,
        year              INTEGER,
        category          TEXT,
        role              TEXT,
        description       TEXT,
        short_description TEXT,
        featured          INTEGER NOT NULL DEFAULT 0,
        published         INTEGER NOT NULL DEFAULT 1,
        sort_order        INTEGER NOT NULL DEFAULT 0,
        hero_image        TEXT,
        hero_video        TEXT,
        thumbnail_image   TEXT,
        accent_color      TEXT,
        external_url      TEXT,
        case_study_url    TEXT,
        created_at        TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX idx_projects_published ON projects(published, sort_order);
      CREATE INDEX idx_projects_featured ON projects(featured, sort_order);

      CREATE TABLE project_media (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        type       TEXT NOT NULL DEFAULT 'image',
        src        TEXT NOT NULL,
        poster     TEXT,
        alt        TEXT NOT NULL DEFAULT '',
        caption    TEXT,
        width      INTEGER,
        height     INTEGER,
        sort_order INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX idx_media_project ON project_media(project_id, sort_order);

      CREATE TABLE playground_items (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        slug         TEXT NOT NULL UNIQUE,
        title        TEXT NOT NULL,
        description  TEXT,
        type         TEXT NOT NULL DEFAULT 'image',
        thumbnail    TEXT,
        media        TEXT,
        external_url TEXT,
        published    INTEGER NOT NULL DEFAULT 1,
        sort_order   INTEGER NOT NULL DEFAULT 0,
        created_at   TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX idx_playground_published ON playground_items(published, sort_order);

      CREATE TABLE contact_messages (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL,
        email      TEXT NOT NULL,
        company    TEXT,
        message    TEXT NOT NULL,
        source     TEXT,
        status     TEXT NOT NULL DEFAULT 'new',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX idx_messages_status ON contact_messages(status, created_at);

      CREATE TABLE site_settings (
        id            INTEGER PRIMARY KEY CHECK (id = 1),
        data          TEXT NOT NULL,
        updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE admin_users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        email         TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at    TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
];
