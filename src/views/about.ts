import { html } from "../lib/html.ts";
import { renderPage } from "./layout.ts";
import { icons } from "./components/icons.ts";
import type { SiteSettings } from "../types/index.ts";

export function renderAbout(settings: SiteSettings): string {
  const body = html`
    <section class="about-hero container">
      <p class="eyebrow" data-reveal>About</p>
      <p class="about-intro" data-reveal style="--reveal-delay:60ms">
        ${settings.intro}
      </p>
    </section>

    <section class="about-bio container">
      <div>
        <p class="eyebrow" data-reveal>Biography</p>
      </div>
      <div class="about-bio__body">
        ${settings.bio.map((para) => html`<p data-reveal>${para}</p>`)}
      </div>
    </section>

    <section class="section container">
      <div class="section-head"><h2>Capabilities</h2></div>
      <div class="capabilities">
        ${settings.capabilities.map(
          (c) => html`
            <div class="capability" data-reveal>
              <h3>${c.title}</h3>
              <ul>
                ${c.items.map((i) => html`<li>${i}</li>`)}
              </ul>
            </div>
          `,
        )}
      </div>
    </section>

    <section class="section container">
      <div class="section-head"><h2>Process</h2></div>
      <div class="process-list" data-process>
        ${settings.process.map(
          (step) => html`
            <div class="process-item" data-open="false" data-process-item>
              <button
                class="process-item__head"
                type="button"
                aria-expanded="false"
                data-process-toggle
              >
                <span class="process-item__index"
                  >${String(step.index).padStart(2, "0")}</span
                >
                <span class="process-item__title">${step.title}</span>
                <span class="process-item__toggle">${icons.plus()}</span>
              </button>
              <div class="process-item__panel">
                <div>${step.description}</div>
              </div>
            </div>
          `,
        )}
      </div>
    </section>

    <section class="section container">
      <div class="section-head"><h2>Selected clients</h2></div>
      <div class="clients" data-reveal>
        ${settings.clients.map((c) => html`<span>${c}</span>`)}
      </div>
    </section>

    <section class="section container" data-reveal>
      <p class="display" style="max-width: 16ch">
        Let's build something considered.
      </p>
      <p style="margin-top: var(--space-5)">
        <a class="btn" href="/contact" data-cursor="link"
          >Start a project ${icons.arrow()}</a
        >
      </p>
    </section>
  `;

  return renderPage({
    settings,
    body,
    bodyClass: "page-about",
    meta: {
      title: "About",
      description: settings.intro,
      path: "/about",
    },
  });
}
