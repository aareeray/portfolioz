/**
 * Repository layer — the single seam between the app and persistence.
 * Re-implement these functions with Prisma Client to move to PostgreSQL without
 * touching handlers or views (see docs/architecture.md).
 */
import { getDb } from "../lib/db.ts";
import { defaultSettings } from "./defaultSettings.ts";
import type {
  Project,
  ProjectWithMedia,
  ProjectMedia,
  PlaygroundItem,
  ContactMessage,
  SiteSettings,
  AdminUser,
  MessageStatus,
} from "../types/index.ts";

/* ------------------------------------------------------------------ mappers */

type Row = Record<string, unknown>;

function toProject(r: Row): Project {
  return {
    id: r.id as number,
    slug: r.slug as string,
    title: r.title as string,
    subtitle: (r.subtitle as string) ?? null,
    client: (r.client as string) ?? null,
    year: (r.year as number) ?? null,
    category: (r.category as string) ?? null,
    role: (r.role as string) ?? null,
    description: (r.description as string) ?? null,
    shortDescription: (r.short_description as string) ?? null,
    featured: Boolean(r.featured),
    published: Boolean(r.published),
    sortOrder: r.sort_order as number,
    heroImage: (r.hero_image as string) ?? null,
    heroVideo: (r.hero_video as string) ?? null,
    thumbnailImage: (r.thumbnail_image as string) ?? null,
    accentColor: (r.accent_color as string) ?? null,
    externalUrl: (r.external_url as string) ?? null,
    caseStudyUrl: (r.case_study_url as string) ?? null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function toMedia(r: Row): ProjectMedia {
  return {
    id: r.id as number,
    projectId: r.project_id as number,
    type: r.type as ProjectMedia["type"],
    src: r.src as string,
    poster: (r.poster as string) ?? null,
    alt: (r.alt as string) ?? "",
    caption: (r.caption as string) ?? null,
    width: (r.width as number) ?? null,
    height: (r.height as number) ?? null,
    sortOrder: r.sort_order as number,
  };
}

function toPlayground(r: Row): PlaygroundItem {
  return {
    id: r.id as number,
    slug: r.slug as string,
    title: r.title as string,
    description: (r.description as string) ?? null,
    type: r.type as PlaygroundItem["type"],
    thumbnail: (r.thumbnail as string) ?? null,
    media: (r.media as string) ?? null,
    externalUrl: (r.external_url as string) ?? null,
    published: Boolean(r.published),
    sortOrder: r.sort_order as number,
    createdAt: r.created_at as string,
  };
}

function toMessage(r: Row): ContactMessage {
  return {
    id: r.id as number,
    name: r.name as string,
    email: r.email as string,
    company: (r.company as string) ?? null,
    message: r.message as string,
    source: (r.source as string) ?? null,
    status: r.status as MessageStatus,
    createdAt: r.created_at as string,
  };
}

/* ----------------------------------------------------------------- projects */

export function listProjects(
  opts: { publishedOnly?: boolean } = {},
): Project[] {
  const db = getDb();
  const where = opts.publishedOnly ? "WHERE published = 1" : "";
  const rows = db
    .prepare(`SELECT * FROM projects ${where} ORDER BY sort_order ASC, id ASC`)
    .all() as Row[];
  return rows.map(toProject);
}

export function listFeaturedProjects(): Project[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM projects WHERE published = 1 AND featured = 1 ORDER BY sort_order ASC, id ASC`,
    )
    .all() as Row[];
  return rows.map(toProject);
}

export function getProjectBySlug(
  slug: string,
  opts: { publishedOnly?: boolean } = {},
): ProjectWithMedia | null {
  const db = getDb();
  const extra = opts.publishedOnly ? "AND published = 1" : "";
  const row = db
    .prepare(`SELECT * FROM projects WHERE slug = ? ${extra}`)
    .get(slug) as Row | undefined;
  if (!row) return null;
  const project = toProject(row);
  const media = (
    db
      .prepare(
        `SELECT * FROM project_media WHERE project_id = ? ORDER BY sort_order ASC, id ASC`,
      )
      .all(project.id) as Row[]
  ).map(toMedia);
  return { ...project, media };
}

export function getProjectById(id: number): ProjectWithMedia | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM projects WHERE id = ?`).get(id) as
    Row | undefined;
  if (!row) return null;
  const project = toProject(row);
  const media = (
    db
      .prepare(
        `SELECT * FROM project_media WHERE project_id = ? ORDER BY sort_order ASC, id ASC`,
      )
      .all(project.id) as Row[]
  ).map(toMedia);
  return { ...project, media };
}

/** Return the previous/next published project for detail-page navigation. */
export function getAdjacentProjects(project: Project): {
  prev: Project | null;
  next: Project | null;
} {
  const published = listProjects({ publishedOnly: true });
  const idx = published.findIndex((p) => p.id === project.id);
  if (idx === -1) return { prev: null, next: null };
  const prev =
    idx > 0 ? published[idx - 1]! : (published[published.length - 1] ?? null);
  const next =
    idx < published.length - 1 ? published[idx + 1]! : (published[0] ?? null);
  return {
    prev: prev && prev.id !== project.id ? prev : null,
    next: next && next.id !== project.id ? next : null,
  };
}

export interface ProjectInput {
  slug: string;
  title: string;
  subtitle?: string | null;
  client?: string | null;
  year?: number | null;
  category?: string | null;
  role?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  featured?: boolean;
  published?: boolean;
  sortOrder?: number;
  heroImage?: string | null;
  heroVideo?: string | null;
  thumbnailImage?: string | null;
  accentColor?: string | null;
  externalUrl?: string | null;
  caseStudyUrl?: string | null;
}

export function createProject(input: ProjectInput): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO projects
      (slug, title, subtitle, client, year, category, role, description, short_description,
       featured, published, sort_order, hero_image, hero_video, thumbnail_image, accent_color,
       external_url, case_study_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    input.slug,
    input.title,
    input.subtitle ?? null,
    input.client ?? null,
    input.year ?? null,
    input.category ?? null,
    input.role ?? null,
    input.description ?? null,
    input.shortDescription ?? null,
    input.featured ? 1 : 0,
    input.published === false ? 0 : 1,
    input.sortOrder ?? 0,
    input.heroImage ?? null,
    input.heroVideo ?? null,
    input.thumbnailImage ?? null,
    input.accentColor ?? null,
    input.externalUrl ?? null,
    input.caseStudyUrl ?? null,
  );
  return Number(info.lastInsertRowid);
}

export function updateProject(id: number, input: ProjectInput): void {
  const db = getDb();
  db.prepare(
    `
    UPDATE projects SET
      slug = ?, title = ?, subtitle = ?, client = ?, year = ?, category = ?, role = ?,
      description = ?, short_description = ?, featured = ?, published = ?, sort_order = ?,
      hero_image = ?, hero_video = ?, thumbnail_image = ?, accent_color = ?, external_url = ?,
      case_study_url = ?, updated_at = datetime('now')
    WHERE id = ?
  `,
  ).run(
    input.slug,
    input.title,
    input.subtitle ?? null,
    input.client ?? null,
    input.year ?? null,
    input.category ?? null,
    input.role ?? null,
    input.description ?? null,
    input.shortDescription ?? null,
    input.featured ? 1 : 0,
    input.published === false ? 0 : 1,
    input.sortOrder ?? 0,
    input.heroImage ?? null,
    input.heroVideo ?? null,
    input.thumbnailImage ?? null,
    input.accentColor ?? null,
    input.externalUrl ?? null,
    input.caseStudyUrl ?? null,
    id,
  );
}

export function deleteProject(id: number): void {
  getDb().prepare(`DELETE FROM projects WHERE id = ?`).run(id);
}

export function setProjectFlags(
  id: number,
  flags: { featured?: boolean; published?: boolean },
): void {
  const db = getDb();
  if (flags.featured !== undefined) {
    db.prepare(
      `UPDATE projects SET featured = ?, updated_at = datetime('now') WHERE id = ?`,
    ).run(flags.featured ? 1 : 0, id);
  }
  if (flags.published !== undefined) {
    db.prepare(
      `UPDATE projects SET published = ?, updated_at = datetime('now') WHERE id = ?`,
    ).run(flags.published ? 1 : 0, id);
  }
}

export function existingSlugs(exceptId?: number): string[] {
  const db = getDb();
  const rows = (
    exceptId
      ? db.prepare(`SELECT slug FROM projects WHERE id != ?`).all(exceptId)
      : db.prepare(`SELECT slug FROM projects`).all()
  ) as Array<{ slug: string }>;
  return rows.map((r) => r.slug);
}

/* -------------------------------------------------------------- media CRUD */

export interface MediaInput {
  type: ProjectMedia["type"];
  src: string;
  poster?: string | null;
  alt?: string;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  sortOrder?: number;
}

export function addProjectMedia(projectId: number, m: MediaInput): number {
  const info = getDb()
    .prepare(
      `INSERT INTO project_media (project_id, type, src, poster, alt, caption, width, height, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      projectId,
      m.type,
      m.src,
      m.poster ?? null,
      m.alt ?? "",
      m.caption ?? null,
      m.width ?? null,
      m.height ?? null,
      m.sortOrder ?? 0,
    );
  return Number(info.lastInsertRowid);
}

export function deleteProjectMedia(id: number): void {
  getDb().prepare(`DELETE FROM project_media WHERE id = ?`).run(id);
}

/* --------------------------------------------------------------- playground */

export function listPlayground(
  opts: { publishedOnly?: boolean } = {},
): PlaygroundItem[] {
  const where = opts.publishedOnly ? "WHERE published = 1" : "";
  const rows = getDb()
    .prepare(
      `SELECT * FROM playground_items ${where} ORDER BY sort_order ASC, id ASC`,
    )
    .all() as Row[];
  return rows.map(toPlayground);
}

export function getPlaygroundById(id: number): PlaygroundItem | null {
  const row = getDb()
    .prepare(`SELECT * FROM playground_items WHERE id = ?`)
    .get(id) as Row | undefined;
  return row ? toPlayground(row) : null;
}

export interface PlaygroundInput {
  slug: string;
  title: string;
  description?: string | null;
  type: PlaygroundItem["type"];
  thumbnail?: string | null;
  media?: string | null;
  externalUrl?: string | null;
  published?: boolean;
  sortOrder?: number;
}

export function createPlayground(input: PlaygroundInput): number {
  const info = getDb()
    .prepare(
      `INSERT INTO playground_items (slug, title, description, type, thumbnail, media, external_url, published, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.slug,
      input.title,
      input.description ?? null,
      input.type,
      input.thumbnail ?? null,
      input.media ?? null,
      input.externalUrl ?? null,
      input.published === false ? 0 : 1,
      input.sortOrder ?? 0,
    );
  return Number(info.lastInsertRowid);
}

export function updatePlayground(id: number, input: PlaygroundInput): void {
  getDb()
    .prepare(
      `UPDATE playground_items SET slug=?, title=?, description=?, type=?, thumbnail=?, media=?, external_url=?, published=?, sort_order=? WHERE id=?`,
    )
    .run(
      input.slug,
      input.title,
      input.description ?? null,
      input.type,
      input.thumbnail ?? null,
      input.media ?? null,
      input.externalUrl ?? null,
      input.published === false ? 0 : 1,
      input.sortOrder ?? 0,
      id,
    );
}

export function deletePlayground(id: number): void {
  getDb().prepare(`DELETE FROM playground_items WHERE id = ?`).run(id);
}

export function playgroundSlugs(exceptId?: number): string[] {
  const rows = (
    exceptId
      ? getDb()
          .prepare(`SELECT slug FROM playground_items WHERE id != ?`)
          .all(exceptId)
      : getDb().prepare(`SELECT slug FROM playground_items`).all()
  ) as Array<{ slug: string }>;
  return rows.map((r) => r.slug);
}

/* ----------------------------------------------------------------- messages */

export function createMessage(input: {
  name: string;
  email: string;
  company?: string | null;
  message: string;
  source?: string | null;
}): number {
  const info = getDb()
    .prepare(
      `INSERT INTO contact_messages (name, email, company, message, source) VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      input.name,
      input.email,
      input.company ?? null,
      input.message,
      input.source ?? null,
    );
  return Number(info.lastInsertRowid);
}

export function listMessages(): ContactMessage[] {
  return (
    getDb()
      .prepare(
        `SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC`,
      )
      .all() as Row[]
  ).map(toMessage);
}

export function getMessageById(id: number): ContactMessage | null {
  const row = getDb()
    .prepare(`SELECT * FROM contact_messages WHERE id = ?`)
    .get(id) as Row | undefined;
  return row ? toMessage(row) : null;
}

export function setMessageStatus(id: number, status: MessageStatus): void {
  getDb()
    .prepare(`UPDATE contact_messages SET status = ? WHERE id = ?`)
    .run(status, id);
}

export function countNewMessages(): number {
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS c FROM contact_messages WHERE status = 'new'`)
    .get() as { c: number };
  return row.c;
}

/* ------------------------------------------------------------------ settings */

export function getSettings(): SiteSettings {
  const row = getDb()
    .prepare(`SELECT data FROM site_settings WHERE id = 1`)
    .get() as { data: string } | undefined;
  if (!row) return defaultSettings;
  try {
    return {
      ...defaultSettings,
      ...(JSON.parse(row.data) as Partial<SiteSettings>),
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: SiteSettings): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO site_settings (id, data, updated_at) VALUES (1, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = datetime('now')`,
  ).run(JSON.stringify(settings));
}

/* -------------------------------------------------------------- admin users */

export function getAdminByEmail(email: string): AdminUser | null {
  const row = getDb()
    .prepare(`SELECT * FROM admin_users WHERE email = ?`)
    .get(email.toLowerCase()) as Row | undefined;
  if (!row) return null;
  return {
    id: row.id as number,
    email: row.email as string,
    passwordHash: row.password_hash as string,
    createdAt: row.created_at as string,
  };
}

export function createAdmin(email: string, passwordHash: string): number {
  const info = getDb()
    .prepare(`INSERT INTO admin_users (email, password_hash) VALUES (?, ?)`)
    .run(email.toLowerCase(), passwordHash);
  return Number(info.lastInsertRowid);
}

export function countAdmins(): number {
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS c FROM admin_users`)
    .get() as { c: number };
  return row.c;
}
