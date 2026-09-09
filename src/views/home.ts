import { html, raw } from "../lib/html.ts";
import type { RawHtml } from "../lib/html.ts";
import { renderPage } from "./layout.ts";
import type { Project, SiteSettings } from "../types/index.ts";

export function renderHome(
  settings: SiteSettings,
  projects: Project[],
): string {
  const totalCount = projects.length || 19;
  const first = projects[0] || {
    title: "DAFI TROPICDANE",
    role: "Design Direction · Website Design",
    year: 2026,
    category: "Furniture",
    description: "A minimal, Scandinavian-inspired website for DAFI, a Danish company specializing in high-quality indoor and outdoor furniture.",
  };

  const body = html`
    <div class="home-viewport" data-home-root>
      <!-- LEFT COLUMN: Live Project Metadata & Counter -->
      <aside class="meta-sidebar" aria-label="Project details">
        <div class="meta-block" data-meta-role>
          <span class="meta-label">Role</span>
          <div class="meta-val" data-role-val>${first.role ?? "Design Direction · Website Design"}</div>
        </div>

        <div class="meta-block" data-meta-launch>
          <span class="meta-label">Launch</span>
          <div class="meta-val" data-launch-val>${first.year ? `April ${first.year}` : "April 2026"}</div>
        </div>

        <div class="meta-block" data-meta-recog>
          <span class="meta-label">Recognition</span>
          <div class="meta-val meta-recog-list" data-recog-val>
            <span>Awwwards Site of the Day</span>
            <span>Awwwards Site of the Month Nominee</span>
            <span>CSS Design Awards Website of the Day</span>
            <span>FWA of the Day</span>
          </div>
        </div>

        <div class="selected-work-counter">
          <span class="counter-label">Selected work</span>
          <div class="counter-display">
            <div class="counter-num-wrap">
              <span class="counter-current" data-counter-current>01</span>
            </div>
            <span class="counter-total">/${String(totalCount).padStart(2, "0")}</span>
          </div>
        </div>

        <div class="scroll-hint">Scroll</div>
      </aside>

      <!-- CENTER STAGE: 3D Floating Perspective Visual Cards -->
      <section class="visual-stage" aria-label="Visual showcase">
        <div class="stage-perspective-wrap">
          <div class="card-cascade" data-card-cascade>
            ${projects.map((p, idx) => {
              const cardSrc = p.thumbnailImage ?? `/media/cards/card_${(idx % 19) + 1}.jpg`;
              const isFirst = idx === 0;
              return html`
                <div
                  class="stage-card ${isFirst ? "is-active" : ""}"
                  data-card-index="${idx}"
                  data-slug="${p.slug}"
                  style="--card-accent: ${p.accentColor ?? "#111"}"
                >
                  <div class="card-inner">
                    <img
                      src="${cardSrc}"
                      alt="${p.title}"
                      class="card-img"
                      loading="${idx < 3 ? "eager" : "lazy"}"
                    />
                    <div class="card-glass-gloss"></div>
                  </div>
                </div>
              `;
            })}
          </div>
        </div>
      </section>

      <!-- RIGHT COLUMN: Interactive Project Navigation Stack -->
      <main class="projects-stack" id="projects-feed" aria-label="Projects list">
        ${projects.map((p, idx) => {
          const isFirst = idx === 0;
          return html`
            <article
              class="project-item ${isFirst ? "is-active" : ""}"
              data-project-item
              data-index="${idx}"
              data-index-str="${String(idx + 1).padStart(2, "0")}"
              data-title="${p.title}"
              data-role="${p.role ?? "Website Design"}"
              data-launch="${p.year ? `April ${p.year}` : "April 2026"}"
              data-category="${p.category ?? "Agency & Studio"}"
              data-slug="${p.slug}"
              data-accent="${p.accentColor ?? "#000"}"
            >
              <span class="project-cat">${p.category ?? "Design & Direction"}</span>
              <h2 class="project-title">
                <a href="/work/${p.slug}" class="project-title-link">
                  ${p.title}
                </a>
              </h2>
              <div class="project-dash">—</div>
              <p class="project-desc">${p.shortDescription ?? p.description}</p>

              <div class="project-swatches">
                <span class="swatch" style="background-color: ${p.accentColor ?? "#111"}"></span>
                <span class="swatch" style="background-color: #ffffff"></span>
                <span class="swatch" style="background-color: #222222"></span>
              </div>
            </article>
          `;
        })}
      </main>

      <!-- BOTTOM-RIGHT: Showreel pill trigger -->
      <button class="showreel-pill" type="button" data-open-showreel aria-label="Watch '25 Showreel">
        <span class="showreel-text">'25 showreel</span>
        <span class="showreel-play" aria-hidden="true">▶</span>
      </button>
    </div>
  `;

  return renderPage({
    meta: {
      title: "Huy Phan - Award-winning designer",
      description: settings.description,
      path: "/",
      ogImage: "/media/huyml_og.png",
    },
    settings,
    body,
    bodyClass: "page-home-viewport",
  });
}
