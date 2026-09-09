import { html } from "../lib/html.ts";
import { renderPage } from "./layout.ts";
import { smartImage } from "./components/media.ts";
import type { PlaygroundItem, SiteSettings } from "../types/index.ts";

export function renderPlayground(
  settings: SiteSettings,
  items: PlaygroundItem[],
): string {
  const body = html`
    <section
      class="section container"
      style="padding-top: calc(var(--header-h) + var(--space-9))"
    >
      <div class="section-head">
        <div>
          <p class="eyebrow" data-reveal>Experiments &amp; studies</p>
          <h1 class="display" data-reveal style="margin-top: var(--space-3)">
            Playground
          </h1>
        </div>
      </div>
      <p
        class="lead"
        data-reveal
        style="max-width: 44ch; margin-bottom: var(--space-8)"
      >
        Loose ends, motion studies, and things made for the joy of making. Each
        tile runs in isolation — if one misbehaves, the rest keep playing.
      </p>

      <div class="playground-grid">
        ${items.map(
          (item) => html`
            <article
              class="playground-card"
              data-reveal
              data-cursor="view"
              data-experiment="${item.type}"
              data-experiment-slug="${item.slug}"
            >
              ${
                item.externalUrl
                  ? html`<a
                      href="${item.externalUrl}"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="position:absolute;inset:0;z-index:2"
                      aria-label="${item.title}"
                    ></a>`
                  : ""
              }
              ${smartImage({
                src: item.thumbnail ?? item.media ?? "/media/og-default.svg",
                alt: item.title,
                width: 1000,
                height: 1000,
              })}
              <div class="playground-card__row">
                <h2 class="playground-card__title">${item.title}</h2>
                <span class="playground-card__type">${item.type}</span>
              </div>
              ${item.description ? html`<p class="muted" style="font-size: var(--text-sm)">${item.description}</p>` : ""}
            </article>
          `,
        )}
      </div>
    </section>
  `;

  return renderPage({
    settings,
    body,
    bodyClass: "page-playground",
    meta: {
      title: "Playground",
      description: `Experiments, motion studies, and interactive toys by ${settings.siteTitle}.`,
      path: "/playground",
    },
  });
}
