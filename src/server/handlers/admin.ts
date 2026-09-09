/** Admin CMS routes — auth-gated, CSRF-protected form posts. */
import type { Router, RequestContext } from "../router.ts";
import { sendHtml, redirect, sendText } from "../respond.ts";
import { parseBody } from "../body.ts";
import { serializeCookie } from "../../lib/cookies.ts";
import {
  createSession,
  createCsrfToken,
  verifyCsrfToken,
  verifyPassword,
  SESSION_COOKIE,
} from "../../lib/auth.ts";
import { config } from "../../config.ts";
import { slugify, uniqueSlug } from "../../lib/slug.ts";
import {
  getAdminByEmail,
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  existingSlugs,
  addProjectMedia,
  deleteProjectMedia,
  listPlayground,
  getPlaygroundById,
  createPlayground,
  updatePlayground,
  deletePlayground,
  playgroundSlugs,
  listMessages,
  countNewMessages,
  setMessageStatus,
  getSettings,
  saveSettings,
} from "../../data/repo.ts";
import {
  renderLogin,
  renderDashboard,
  renderProjectList,
  renderProjectForm,
  renderPlaygroundList,
  renderPlaygroundForm,
  renderMessages,
  renderSettings,
} from "../../views/admin/pages.ts";
import type {
  MediaType,
  PlaygroundType,
  SiteSettings,
  MessageStatus,
} from "../../types/index.ts";
import { logger } from "../../lib/logger.ts";

/** Guard: return session or redirect to login. Returns null when redirected. */
function requireAuth(ctx: RequestContext): { email: string } | null {
  if (!ctx.session) {
    redirect(ctx.res, "/admin/login");
    return null;
  }
  return { email: ctx.session.email };
}

function str(body: Record<string, unknown>, key: string): string | null {
  const val = body[key];
  if (typeof val !== "string") return null;
  const t = val.trim();
  return t === "" ? null : t;
}

function num(body: Record<string, unknown>, key: string): number | null {
  const s = str(body, key);
  if (s === null) return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

function bool(body: Record<string, unknown>, key: string): boolean {
  const val = body[key];
  return val === "on" || val === "true" || val === true || val === "1";
}

/** Validate CSRF for the current session; respond 403 and return false on failure. */
function checkCsrf(
  ctx: RequestContext,
  body: Record<string, unknown>,
): boolean {
  const token = typeof body.csrf === "string" ? body.csrf : undefined;
  const binding = ctx.sessionToken || "public";
  if (!verifyCsrfToken(binding, token)) {
    sendText(ctx.res, "Invalid CSRF token", 403);
    return false;
  }
  return true;
}

export function registerAdminRoutes(router: Router): void {
  /* ---- auth ---- */
  router.get("/admin/login", (ctx) => {
    if (ctx.session) return redirect(ctx.res, "/admin");
    const csrf = createCsrfToken(ctx.sessionToken || "public");
    const message = ctx.query.get("error") ?? undefined;
    sendHtml(ctx.res, renderLogin(csrf, message));
  });

  router.post("/admin/login", async (ctx) => {
    const body = await parseBody(ctx.req);
    if (
      !verifyCsrfToken(
        ctx.sessionToken || "public",
        typeof body.csrf === "string" ? body.csrf : undefined,
      )
    ) {
      return redirect(
        ctx.res,
        "/admin/login?error=Session%20expired%2C%20try%20again",
        303,
      );
    }
    const email = str(body, "email") ?? "";
    const password = str(body, "password") ?? "";
    const user = getAdminByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      logger.warn("admin.login.failed", { email, ip: ctx.ip });
      return redirect(ctx.res, "/admin/login?error=Invalid%20credentials", 303);
    }
    const token = createSession({
      userId: user.id,
      email: user.email,
      iat: Date.now(),
    });
    ctx.res.setHeader(
      "Set-Cookie",
      serializeCookie(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: config.isProd,
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60,
      }),
    );
    logger.info("admin.login.ok", { email: user.email });
    redirect(ctx.res, "/admin", 303);
  });

  router.post("/admin/logout", (ctx) => {
    ctx.res.setHeader(
      "Set-Cookie",
      serializeCookie(SESSION_COOKIE, "", { httpOnly: true, maxAge: 0 }),
    );
    redirect(ctx.res, "/admin/login", 303);
  });

  /* ---- dashboard ---- */
  router.get("/admin", (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    const projects = listProjects();
    sendHtml(
      ctx.res,
      renderDashboard(auth.email, {
        projects: projects.length,
        published: projects.filter((p) => p.published).length,
        playground: listPlayground().length,
        messages: listMessages().length,
        newMessages: countNewMessages(),
      }),
    );
  });

  /* ---- projects ---- */
  router.get("/admin/projects", (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    const csrf = createCsrfToken(ctx.sessionToken);
    sendHtml(
      ctx.res,
      renderProjectList(
        auth.email,
        countNewMessages(),
        listProjects(),
        csrf,
        ctx.query.get("flash") ?? undefined,
      ),
    );
  });

  router.get("/admin/projects/new", (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    sendHtml(
      ctx.res,
      renderProjectForm(
        auth.email,
        countNewMessages(),
        createCsrfToken(ctx.sessionToken),
        null,
      ),
    );
  });

  router.post("/admin/projects", async (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    const body = await parseBody(ctx.req);
    if (!checkCsrf(ctx, body)) return;
    const title = str(body, "title");
    if (!title) return redirect(ctx.res, "/admin/projects/new", 303);
    const slug = uniqueSlug(str(body, "slug") ?? title, existingSlugs());
    const id = createProject({
      slug,
      title,
      subtitle: str(body, "subtitle"),
      client: str(body, "client"),
      year: num(body, "year"),
      category: str(body, "category"),
      role: str(body, "role"),
      description: str(body, "description"),
      shortDescription: str(body, "shortDescription"),
      featured: bool(body, "featured"),
      published: bool(body, "published"),
      sortOrder: num(body, "sortOrder") ?? 0,
      heroImage: str(body, "heroImage"),
      heroVideo: str(body, "heroVideo"),
      thumbnailImage: str(body, "thumbnailImage"),
      accentColor: str(body, "accentColor"),
      externalUrl: str(body, "externalUrl"),
      caseStudyUrl: str(body, "caseStudyUrl"),
    });
    redirect(ctx.res, `/admin/projects/${id}?flash=Created`, 303);
  });

  router.get("/admin/projects/:id", (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    const project = getProjectById(Number(ctx.params.id));
    if (!project) return redirect(ctx.res, "/admin/projects", 303);
    sendHtml(
      ctx.res,
      renderProjectForm(
        auth.email,
        countNewMessages(),
        createCsrfToken(ctx.sessionToken),
        project,
        ctx.query.get("flash") ?? undefined,
      ),
    );
  });

  router.post("/admin/projects/:id", async (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    const id = Number(ctx.params.id);
    const body = await parseBody(ctx.req);
    if (!checkCsrf(ctx, body)) return;
    const existing = getProjectById(id);
    if (!existing) return redirect(ctx.res, "/admin/projects", 303);
    const title = str(body, "title") ?? existing.title;
    const requestedSlug = str(body, "slug") ?? existing.slug;
    const slug =
      requestedSlug === existing.slug
        ? existing.slug
        : uniqueSlug(requestedSlug, existingSlugs(id));
    updateProject(id, {
      slug,
      title,
      subtitle: str(body, "subtitle"),
      client: str(body, "client"),
      year: num(body, "year"),
      category: str(body, "category"),
      role: str(body, "role"),
      description: str(body, "description"),
      shortDescription: str(body, "shortDescription"),
      featured: bool(body, "featured"),
      published: bool(body, "published"),
      sortOrder: num(body, "sortOrder") ?? 0,
      heroImage: str(body, "heroImage"),
      heroVideo: str(body, "heroVideo"),
      thumbnailImage: str(body, "thumbnailImage"),
      accentColor: str(body, "accentColor"),
      externalUrl: str(body, "externalUrl"),
      caseStudyUrl: str(body, "caseStudyUrl"),
    });
    redirect(ctx.res, `/admin/projects/${id}?flash=Saved`, 303);
  });

  router.post("/admin/projects/:id/delete", async (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    const body = await parseBody(ctx.req);
    if (!checkCsrf(ctx, body)) return;
    deleteProject(Number(ctx.params.id));
    redirect(ctx.res, "/admin/projects?flash=Deleted", 303);
  });

  router.post("/admin/projects/:id/media", async (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    const id = Number(ctx.params.id);
    const body = await parseBody(ctx.req);
    if (!checkCsrf(ctx, body)) return;
    const src = str(body, "src");
    if (src) {
      addProjectMedia(id, {
        type: (str(body, "type") as MediaType) ?? "image",
        src,
        alt: str(body, "alt") ?? "",
        sortOrder: num(body, "sortOrder") ?? 0,
      });
    }
    redirect(ctx.res, `/admin/projects/${id}?flash=Media%20added`, 303);
  });

  router.post("/admin/projects/:id/media/:mediaId/delete", async (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    const body = await parseBody(ctx.req);
    if (!checkCsrf(ctx, body)) return;
    deleteProjectMedia(Number(ctx.params.mediaId));
    redirect(
      ctx.res,
      `/admin/projects/${ctx.params.id}?flash=Media%20removed`,
      303,
    );
  });

  /* ---- playground ---- */
  router.get("/admin/playground", (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    sendHtml(
      ctx.res,
      renderPlaygroundList(
        auth.email,
        countNewMessages(),
        listPlayground(),
        createCsrfToken(ctx.sessionToken),
        ctx.query.get("flash") ?? undefined,
      ),
    );
  });

  router.get("/admin/playground/new", (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    sendHtml(
      ctx.res,
      renderPlaygroundForm(
        auth.email,
        countNewMessages(),
        createCsrfToken(ctx.sessionToken),
        null,
      ),
    );
  });

  router.post("/admin/playground", async (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    const body = await parseBody(ctx.req);
    if (!checkCsrf(ctx, body)) return;
    const title = str(body, "title");
    if (!title) return redirect(ctx.res, "/admin/playground/new", 303);
    const slug = uniqueSlug(str(body, "slug") ?? title, playgroundSlugs());
    const id = createPlayground({
      slug,
      title,
      description: str(body, "description"),
      type: (str(body, "type") as PlaygroundType) ?? "image",
      thumbnail: str(body, "thumbnail"),
      media: str(body, "media"),
      externalUrl: str(body, "externalUrl"),
      published: bool(body, "published"),
      sortOrder: num(body, "sortOrder") ?? 0,
    });
    redirect(ctx.res, `/admin/playground/${id}?flash=Created`, 303);
  });

  router.get("/admin/playground/:id", (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    const item = getPlaygroundById(Number(ctx.params.id));
    if (!item) return redirect(ctx.res, "/admin/playground", 303);
    sendHtml(
      ctx.res,
      renderPlaygroundForm(
        auth.email,
        countNewMessages(),
        createCsrfToken(ctx.sessionToken),
        item,
        ctx.query.get("flash") ?? undefined,
      ),
    );
  });

  router.post("/admin/playground/:id", async (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    const id = Number(ctx.params.id);
    const body = await parseBody(ctx.req);
    if (!checkCsrf(ctx, body)) return;
    const existing = getPlaygroundById(id);
    if (!existing) return redirect(ctx.res, "/admin/playground", 303);
    const title = str(body, "title") ?? existing.title;
    const requestedSlug = str(body, "slug") ?? existing.slug;
    const slug =
      requestedSlug === existing.slug
        ? existing.slug
        : uniqueSlug(requestedSlug, playgroundSlugs(id));
    updatePlayground(id, {
      slug,
      title,
      description: str(body, "description"),
      type: (str(body, "type") as PlaygroundType) ?? "image",
      thumbnail: str(body, "thumbnail"),
      media: str(body, "media"),
      externalUrl: str(body, "externalUrl"),
      published: bool(body, "published"),
      sortOrder: num(body, "sortOrder") ?? 0,
    });
    redirect(ctx.res, `/admin/playground/${id}?flash=Saved`, 303);
  });

  router.post("/admin/playground/:id/delete", async (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    const body = await parseBody(ctx.req);
    if (!checkCsrf(ctx, body)) return;
    deletePlayground(Number(ctx.params.id));
    redirect(ctx.res, "/admin/playground?flash=Deleted", 303);
  });

  /* ---- messages ---- */
  router.get("/admin/messages", (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    sendHtml(
      ctx.res,
      renderMessages(
        auth.email,
        countNewMessages(),
        listMessages(),
        createCsrfToken(ctx.sessionToken),
      ),
    );
  });

  router.post("/admin/messages/:id/status", async (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    const body = await parseBody(ctx.req);
    if (!checkCsrf(ctx, body)) return;
    const status = str(body, "status");
    if (status === "new" || status === "read" || status === "archived") {
      setMessageStatus(Number(ctx.params.id), status as MessageStatus);
    }
    redirect(ctx.res, "/admin/messages", 303);
  });

  /* ---- settings ---- */
  router.get("/admin/settings", (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    sendHtml(
      ctx.res,
      renderSettings(
        auth.email,
        countNewMessages(),
        createCsrfToken(ctx.sessionToken),
        getSettings(),
        ctx.query.get("flash") ?? undefined,
      ),
    );
  });

  router.post("/admin/settings", async (ctx) => {
    const auth = requireAuth(ctx);
    if (!auth) return;
    const body = await parseBody(ctx.req);
    if (!checkCsrf(ctx, body)) return;
    const current = getSettings();
    const next: SiteSettings = {
      ...current,
      siteTitle: str(body, "siteTitle") ?? current.siteTitle,
      email: str(body, "email") ?? current.email,
      location: str(body, "location") ?? current.location,
      timezone: str(body, "timezone") ?? current.timezone,
      availability: str(body, "availability") ?? current.availability,
      showreelUrl: str(body, "showreelUrl"),
      resumeUrl: str(body, "resumeUrl"),
      description: str(body, "description") ?? current.description,
      intro: str(body, "intro") ?? current.intro,
      footerText: str(body, "footerText") ?? current.footerText,
      audioEnabled: bool(body, "audioEnabled"),
      socialLinks: parseLines(str(body, "socialLinks")).map(([label, url]) => ({
        label,
        url,
      })),
      navLabels: Object.fromEntries(parseLines(str(body, "navLabels"))),
    };
    saveSettings(next);
    redirect(ctx.res, "/admin/settings?flash=Saved", 303);
  });
}

/** Parse "Label | value" lines into tuples. */
function parseLines(text: string | null): Array<[string, string]> {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.split("|").map((s) => s.trim()))
    .filter((parts) => parts.length >= 2 && parts[0] && parts[1])
    .map((parts) => [parts[0]!, parts[1]!] as [string, string]);
}
