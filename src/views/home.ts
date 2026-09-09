import { html } from "../lib/html.ts";
import type { RawHtml } from "../lib/html.ts";
import { renderPage } from "./layout.ts";
import { smartImage } from "./components/media.ts";
import { icons } from "./components/icons.ts";
import type { Project, SiteSettings } from "../types/index.ts";

function heroLines(title: string): RawHtml[] {
  return title
    .split("\n")
    .map(
      (line, i) =>
        html`<span class="line"
          ><span data-reveal-line style="--reveal-delay:${i * 90}ms"
            >${line}</span
          ></span
        >`,
    );
}

function workRow(project: Project, index: number): RawHtml {
  return html`
    <article class="work-item" data-reveal data-cursor="view">
      ${smartImage({
        src:
          project.thumbnailImage ??
          project.heroImage ??
          "/media/og-default.svg",
        alt: `${project.title} — ${project.subtitle ?? "project"}`,
        width: 1200,
        height: 900,
        className: "work-item__media",
        sizes: "(max-width: 720px) 100vw, 50vw",
      })}
      <div class="work-item__body">
        <span class="work-item__index"
          >${String(index + 1).padStart(2, "0")} /
          ${project.category ?? "Project"}</span
        >
        <h3 class="work-item__title">${project.title}</h3>
        <p class="work-item__sub">
          ${project.shortDescription ?? project.subtitle ?? ""}
        </p>
        <div class="work-item__tags">
          ${project.role ? html`<span>${project.role}</span>` : ""}
          ${project.year ? html`<span>${project.year}</span>` : ""}
        </div>
      </div>
      <a
        class="work-item__link"
        href="/work/${project.slug}"
        aria-label="View ${project.title}"
      ></a>
    </article>
  `;
}

export function renderHome(
  settings: SiteSettings,
  featured: Project[],
): string {
  const heroTitle = "Design\nin motion";

  const body = html`
    <section class="hero container">
      <p class="eyebrow" data-reveal>${settings.availability}</p>
      <h1 class="hero__title" aria-label="${heroTitle.replace("\n", " ")}">
        ${heroLines(heroTitle)}
      </h1>
      <div class="hero__meta">
        <p class="lead" data-reveal>${settings.intro}</p>
        <div data-reveal>
          <p>${settings.location}</p>
          <p>
            <span class="clock" data-clock data-timezone="${settings.timezone}"
              >--:--</span
            >
            local time
          </p>
          ${
            settings.showreelUrl
              ? html`<p style="margin-top: var(--space-3)">
                  <a
                    class="arrow-link"
                    href="${settings.showreelUrl}"
                    data-cursor="link"
                    data-analytics="showreel"
                    >Watch showreel ${icons.arrowUpRight()}</a
                  >
                </p>`
              : ""
          }
        </div>
      </div>
    </section>

    <section class="section container" aria-labelledby="work-heading">
      <div class="section-head">
        <h2 id="work-heading">Selected work</h2>
        <a class="arrow-link" href="/work" data-cursor="link"
          >All projects ${icons.arrow()}</a
        >
      </div>
      <div class="work-list">${featured.map((p, i) => workRow(p, i))}</div>
    </section>

    <section class="section container" data-reveal>
      <div class="section-head">
        <h2>Approach</h2>
      </div>
      <p class="display" style="max-width: 18ch">${settings.bio[0]}</p>
      <p style="margin-top: var(--space-6)">
        <a class="arrow-link" href="/about" data-cursor="link"
          >More about the studio ${icons.arrow()}</a
        >
      </p>
    </section>
  `;

  return renderPage({
    settings,
    body,
    bodyClass: "page-home",
    meta: {
      title: settings.siteTitle,
      description: settings.description,
      path: "/",
    },
  });
}
