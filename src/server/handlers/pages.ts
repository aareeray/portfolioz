/** Public page routes. */
import type { Router, RequestContext } from "../router.ts";
import { sendHtml, sendText } from "../respond.ts";
import { renderHome } from "../../views/home.ts";
import { renderWork } from "../../views/work.ts";
import { renderProject } from "../../views/project.ts";
import { renderAbout } from "../../views/about.ts";
import { renderPlayground } from "../../views/playground.ts";
import { renderContact } from "../../views/contact.ts";
import { renderError } from "../../views/error.ts";
import {
  getSettings,
  listFeaturedProjects,
  listProjects,
  getProjectBySlug,
  getAdjacentProjects,
  listPlayground,
} from "../../data/repo.ts";
import { createCsrfToken } from "../../lib/auth.ts";
import { config } from "../../config.ts";
import { getAnalytics } from "../../lib/analytics.ts";

export function registerPageRoutes(router: Router): void {
  router.get("/", (ctx) => {
    const settings = getSettings();
    const list = listProjects({ publishedOnly: true });
    sendHtml(ctx.res, renderHome(settings, list));
  });

  router.get("/work", (ctx) => {
    const settings = getSettings();
    const projects = listProjects({ publishedOnly: true });
    sendHtml(ctx.res, renderWork(settings, projects));
  });

  router.get("/work/:slug", (ctx: RequestContext) => {
    const settings = getSettings();
    const project = getProjectBySlug(ctx.params.slug!, { publishedOnly: true });
    if (!project) {
      sendHtml(
        ctx.res,
        renderError(
          404,
          "That project doesn't exist or hasn't been published.",
        ),
        404,
      );
      return;
    }
    getAnalytics().track({ name: "project_viewed", slug: project.slug });
    const { next } = getAdjacentProjects(project);
    sendHtml(ctx.res, renderProject(settings, project, next));
  });

  router.get("/about", (ctx) => {
    sendHtml(ctx.res, renderAbout(getSettings()));
  });

  router.get("/playground", (ctx) => {
    const settings = getSettings();
    sendHtml(
      ctx.res,
      renderPlayground(settings, listPlayground({ publishedOnly: true })),
    );
  });

  router.get("/contact", (ctx) => {
    const settings = getSettings();
    // CSRF token bound to session cookie value (empty string for anonymous is fine —
    // the contact endpoint accepts anonymous submissions but validates the token shape).
    const csrf = createCsrfToken(ctx.sessionToken || "public");
    sendHtml(ctx.res, renderContact(settings, csrf));
  });

  // Legal utility pages (minimal, self-authored).
  router.get("/privacy", (ctx) => {
    const settings = getSettings();
    sendHtml(
      ctx.res,
      renderSimple(
        settings,
        "Privacy",
        "This demo stores only the contact messages you submit and does not use third-party tracking.",
      ),
    );
  });
  router.get("/terms", (ctx) => {
    const settings = getSettings();
    sendHtml(
      ctx.res,
      renderSimple(
        settings,
        "Terms",
        "This project is a study recreation provided as-is under the MIT license.",
      ),
    );
  });

  // robots.txt and sitemap.xml
  router.get("/robots.txt", (ctx) => {
    const body = `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${config.siteUrl}/sitemap.xml\n`;
    sendText(ctx.res, body, 200);
  });

  router.get("/sitemap.xml", (ctx) => {
    const urls = ["/", "/work", "/about", "/playground", "/contact"];
    for (const p of listProjects({ publishedOnly: true }))
      urls.push(`/work/${p.slug}`);
    const body =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map(
          (u) =>
            `  <url><loc>${config.siteUrl}${u === "/" ? "" : u}</loc></url>`,
        )
        .join("\n") +
      `\n</urlset>\n`;
    sendText(ctx.res, body, 200, "application/xml; charset=utf-8");
  });
}

/** Small helper for legal pages (kept inline to avoid extra view files). */
import { renderPage } from "../../views/layout.ts";
import { html } from "../../lib/html.ts";
import type { SiteSettings } from "../../types/index.ts";

function renderSimple(
  settings: SiteSettings,
  title: string,
  text: string,
): string {
  return renderPage({
    settings,
    meta: { title, description: text, path: `/${title.toLowerCase()}` },
    body: html`
      <section
        class="section container"
        style="padding-top: calc(var(--header-h) + var(--space-9)); max-width: var(--container-narrow)"
      >
        <p class="eyebrow">${title}</p>
        <h1 class="display" style="margin-top: var(--space-3)">${title}</h1>
        <p class="lead" style="margin-top: var(--space-5); max-width: 50ch">
          ${text}
        </p>
      </section>
    `,
  });
}
