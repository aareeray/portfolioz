import { html } from "../lib/html.ts";
import { renderPage } from "./layout.ts";
import type { PlaygroundItem, SiteSettings } from "../types/index.ts";

export function renderPlayground(
  settings: SiteSettings,
  items: PlaygroundItem[],
): string {
  const count = items.length || 83;

  const body = html`
    <div class="playground-page">
      <section class="playground-intro-section">
        <div class="playground-container">
          <p class="playground-statement" data-reveal>
            A space where I can explore different visual directions, interactions, and styles without overthinking too much. Some of these ideas eventually evolve into real projects, while others simply stay here as part of the process.
          </p>
        </div>

        <!-- Giant watermark 83 -->
        <div class="watermark-wrap" aria-hidden="true">
          <span class="watermark-num">${count}</span>
        </div>
      </section>

      <!-- Experiments Grid -->
      <section class="playground-grid-section">
        <div class="playground-grid-container">
          ${items.map((it, idx) => {
            const cardNum = ((idx) % 19) + 1;
            const imgSrc = `/media/cards/card_${cardNum}.jpg`;
            return html`
              <article class="experiment-card" data-reveal data-cursor="view">
                <div class="experiment-media-wrap">
                  <img
                    src="${imgSrc}"
                    alt="${it.title}"
                    class="experiment-img"
                    loading="${idx < 6 ? "eager" : "lazy"}"
                  />
                  <div class="experiment-overlay">
                    <span class="experiment-tag">#${String(idx + 1).padStart(2, "0")}</span>
                    <span class="experiment-title">${it.title}</span>
                  </div>
                </div>
              </article>
            `;
          })}
        </div>
      </section>
    </div>
  `;

  return renderPage({
    meta: {
      title: "Playground - Huy Phan",
      description: "A space where I can explore different visual directions, interactions, and styles.",
      path: "/playground",
      ogImage: "/media/cards/card_1.jpg",
    },
    settings,
    body,
    bodyClass: "page-playground",
  });
}
