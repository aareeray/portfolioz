/** JSON API routes: projects, playground, settings, contact. */
import type { Router, RequestContext } from "../router.ts";
import type { AppDeps } from "../app.ts";
import { sendJson, apiError, redirect } from "../respond.ts";
import { parseBody } from "../body.ts";
import { v } from "../../lib/validation.ts";
import {
  listProjects,
  getProjectBySlug,
  listPlayground,
  getSettings,
  createMessage,
} from "../../data/repo.ts";
import { verifyCsrfToken } from "../../lib/auth.ts";
import { getEmailService } from "../../lib/email.ts";
import { getAnalytics } from "../../lib/analytics.ts";
import { config } from "../../config.ts";
import { logger } from "../../lib/logger.ts";

const contactSchema = v.object({
  name: v.string().min(2).max(120),
  email: v.string().email().max(200),
  company: v.string().max(160).optional(),
  message: v.string().min(10).max(4000),
});

export function registerApiRoutes(router: Router, deps: AppDeps): void {
  router.get("/api/projects", (ctx) => {
    const projects = listProjects({ publishedOnly: true }).map(publicProject);
    sendJson(ctx.res, { projects });
  });

  router.get("/api/projects/:slug", (ctx: RequestContext) => {
    const project = getProjectBySlug(ctx.params.slug!, { publishedOnly: true });
    if (!project) {
      apiError(ctx.res, 404, "Project not found");
      return;
    }
    sendJson(ctx.res, {
      project: { ...publicProject(project), media: project.media },
    });
  });

  router.get("/api/playground", (ctx) => {
    sendJson(ctx.res, { items: listPlayground({ publishedOnly: true }) });
  });

  router.get("/api/settings", (ctx) => {
    const s = getSettings();
    // Public subset only — no admin/internal fields exist here, but be explicit.
    sendJson(ctx.res, {
      settings: {
        siteTitle: s.siteTitle,
        description: s.description,
        location: s.location,
        timezone: s.timezone,
        email: s.email,
        availability: s.availability,
        socialLinks: s.socialLinks,
        showreelUrl: s.showreelUrl,
      },
    });
  });

  router.post("/api/contact", async (ctx: RequestContext) => {
    const isJson = (ctx.req.headers["content-type"] ?? "").includes(
      "application/json",
    );

    // Rate limit by IP.
    if (!deps.contactLimiter.take(ctx.ip)) {
      return finish(
        ctx,
        isJson,
        429,
        { error: { message: "Too many submissions. Please try again later." } },
        "error",
        "Too many submissions. Please try again later.",
      );
    }

    let raw: Record<string, unknown>;
    try {
      raw = await parseBody(ctx.req);
    } catch {
      return finish(
        ctx,
        isJson,
        400,
        { error: { message: "Invalid request body" } },
        "error",
        "Invalid request body.",
      );
    }

    // Honeypot: silently accept but drop.
    if (typeof raw.website === "string" && raw.website.trim() !== "") {
      logger.warn("contact.honeypot", { ip: ctx.ip });
      return finish(
        ctx,
        isJson,
        200,
        { ok: true },
        "success",
        "Thanks — your message has been sent.",
      );
    }

    // CSRF (double-submit): token must match the session/public binding.
    const csrf = typeof raw.csrf === "string" ? raw.csrf : undefined;
    if (!verifyCsrfToken(ctx.sessionToken || "public", csrf)) {
      return finish(
        ctx,
        isJson,
        403,
        {
          error: {
            message: "Invalid or missing form token. Reload and try again.",
          },
        },
        "error",
        "Invalid session token. Please reload the page.",
      );
    }

    const parsed = contactSchema.parse(raw);
    if (!parsed.success) {
      return finish(
        ctx,
        isJson,
        422,
        { error: { message: "Validation failed", issues: parsed.issues } },
        "error",
        parsed.issues[0]?.message ?? "Please check the form.",
      );
    }

    const data = parsed.data;
    createMessage({
      name: data.name,
      email: data.email,
      company: data.company ?? null,
      message: data.message,
      source: "contact-form",
    });

    getAnalytics().track({ name: "contact_submitted", source: "contact-form" });

    // Fire-and-log email (non-blocking failure).
    void getEmailService()
      .send({
        to: config.email.to,
        from: config.email.from,
        replyTo: data.email,
        subject: `New enquiry from ${data.name}`,
        text: `Name: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company ?? "-"}\n\n${data.message}`,
      })
      .then((r) => {
        if (!r.ok) logger.warn("contact.email.failed", { error: r.error });
      });

    return finish(
      ctx,
      isJson,
      200,
      { ok: true },
      "success",
      "Thanks — your message has been sent.",
    );
  });
}

function publicProject(p: ReturnType<typeof listProjects>[number]) {
  return {
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    client: p.client,
    year: p.year,
    category: p.category,
    role: p.role,
    shortDescription: p.shortDescription,
    featured: p.featured,
    heroImage: p.heroImage,
    thumbnailImage: p.thumbnailImage,
    accentColor: p.accentColor,
    externalUrl: p.externalUrl,
  };
}

/**
 * Respond as JSON for fetch()/API clients, or redirect back to /contact with a
 * status query for the no-JS progressive-enhancement path.
 */
function finish(
  ctx: RequestContext,
  isJson: boolean,
  status: number,
  json: object,
  kind: "success" | "error",
  message: string,
): void {
  if (isJson) {
    sendJson(ctx.res, json, status);
    return;
  }
  const params = new URLSearchParams({ status: kind, message });
  redirect(ctx.res, `/contact?${params.toString()}#contact`, 303);
}
