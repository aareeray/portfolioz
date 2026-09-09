import { html } from "../lib/html.ts";
import { renderPage } from "./layout.ts";
import { smartImage } from "./components/media.ts";
import type { Project, SiteSettings } from "../types/index.ts";

export function renderWork(
  settings: SiteSettings,
  projects: Project[],
): string {
  const body = html`
    <section
      class="section container"
      style="padding-top: calc(var(--header-h) + var(--space-9))"
    >
      <div class="section-head">
        <div>
          <p class="eyebrow" data-reveal>
            Selected work · ${projects.length} projects
          </p>
          <h1 class="display" data-reveal style="margin-top: var(--space-3)">
            Work
          </h1>
        </div>
      </div>

      <div class="work-grid">
        ${projects.map(
          (p) => html`
            <article class="work-card" data-reveal data-cursor="view">
              ${smartImage({
                src: p.thumbnailImage ?? p.heroImage ?? "/media/og-default.svg",
                alt: `${p.title} — ${p.subtitle ?? "project"}`,
                width: 1200,
                height: 800,
                className: "work-card__media",
                sizes: "(max-width: 720px) 100vw, 50vw",
              })}
              <div class="work-card__row">
                <h2 class="work-card__title">${p.title}</h2>
                <span class="work-card__meta">${p.year ?? ""}</span>
              </div>
              <p class="work-card__meta">${p.category ?? ""}</p>
              <a
                class="work-card__link"
                href="/work/${p.slug}"
                aria-label="View ${p.title}"
              ></a>
            </article>
          `,
        )}
      </div>
    </section>
  `;

  return renderPage({
    settings,
    body,
    bodyClass: "page-work",
    meta: {
      title: "Work",
      description: `Selected projects by ${settings.siteTitle} — brand, product, and interaction design.`,
      path: "/work",
    },
  });
}
