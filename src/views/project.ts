import { html, when } from "../lib/html.ts";
import type { RawHtml } from "../lib/html.ts";
import { renderPage } from "./layout.ts";
import { smartImage, renderProjectMedia } from "./components/media.ts";
import { icons } from "./components/icons.ts";
import { config } from "../config.ts";
import type {
  Project,
  ProjectWithMedia,
  SiteSettings,
} from "../types/index.ts";

/* Data-driven detail page assembled from small sections:
   Hero → Intro → Meta → Media → Text → Gallery → Next */

function projectHero(p: ProjectWithMedia): RawHtml {
  return html`
    <section class="project-hero container">
      <p class="eyebrow" data-reveal>
        ${p.category ?? "Project"} · ${p.year ?? ""}
      </p>
      <h1 class="project-hero__title" data-reveal style="--reveal-delay:60ms">
        ${p.title}
      </h1>
      ${when(p.subtitle, () => html`<p class="project-hero__sub" data-reveal style="--reveal-delay:120ms">${p.subtitle}</p>`)}
      ${when(p.heroImage, () =>
        smartImage({
          src: p.heroImage!,
          alt: `${p.title} — hero`,
          width: 1600,
          height: 900,
          className: "project-media-full",
          loading: "eager",
        }),
      )}
    </section>
  `;
}

function projectMeta(p: Project): RawHtml {
  const rows: Array<[string, string | number | null]> = [
    ["Client", p.client],
    ["Year", p.year],
    ["Role", p.role],
    ["Category", p.category],
  ];
  return html`
    <div class="container">
      <dl class="project-meta" data-reveal>
        ${rows
          .filter(([, v]) => v)
          .map(
            ([k, v]) =>
              html`<div>
                <dt>${k}</dt>
                <dd>${v}</dd>
              </div>`,
          )}
        ${when(
          p.externalUrl,
          () =>
            html`<div>
              <dt>Live</dt>
              <dd>
                <a
                  class="arrow-link"
                  href="${p.externalUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  data-analytics="external"
                  data-slug="${p.slug}"
                  >Visit ${icons.arrowUpRight()}</a
                >
              </dd>
            </div>`,
        )}
      </dl>
    </div>
  `;
}

function projectGallery(p: ProjectWithMedia): RawHtml {
  // Skip the first media item (used as hero) if present.
  const gallery = p.media.filter((m) => m.src !== p.heroImage);
  if (gallery.length === 0) return html``;
  return html`
    <div class="container">
      <div class="project-gallery">
        ${gallery.map((m, i) =>
          m.caption
            ? html`<figure ${i % 3 === 0 ? html`class="wide-fig"` : ""}>
                ${renderProjectMedia(m, i % 3 === 0 ? "wide" : "")}
                <figcaption>${m.caption}</figcaption>
              </figure>`
            : renderProjectMedia(m, i % 3 === 0 ? "wide" : ""),
        )}
      </div>
    </div>
  `;
}

export function renderProject(
  settings: SiteSettings,
  project: ProjectWithMedia,
  next: Project | null,
): string {
  const body = html`
    <article data-analytics-view="${project.slug}">
      ${projectHero(project)} ${projectMeta(project)}
      <section class="project-body container">
        ${when(project.shortDescription, () => html`<p class="project-intro" data-reveal>${project.shortDescription}</p>`)}
        ${when(project.description, () => html`<div class="project-text" data-reveal>${project.description}</div>`)}
      </section>
      ${projectGallery(project)}
      ${when(
        next,
        () =>
          html`<a
            class="project-next"
            href="/work/${next!.slug}"
            data-cursor="view"
            data-transition-link
          >
            <span class="eyebrow">Next project</span>
            <span class="project-next__title"
              >${next!.title} ${icons.arrow()}</span
            >
          </a>`,
      )}
    </article>
  `;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description:
      project.shortDescription ?? project.subtitle ?? settings.description,
    creator: { "@type": "Organization", name: settings.siteTitle },
    dateCreated: project.year ? String(project.year) : undefined,
    url: `${config.siteUrl}/work/${project.slug}`,
  };

  return renderPage({
    settings,
    body,
    bodyClass: "page-project",
    meta: {
      title: project.title,
      description:
        project.shortDescription ?? project.subtitle ?? settings.description,
      path: `/work/${project.slug}`,
      type: "article",
      ogImage: project.heroImage ?? project.thumbnailImage ?? undefined,
      jsonLd,
    },
  });
}
