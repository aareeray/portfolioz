import { html } from "../../lib/html.ts";
import type { RawHtml } from "../../lib/html.ts";
import { currentYear } from "../../lib/time.ts";
import type { SiteSettings } from "../../types/index.ts";

export function renderFooter(settings: SiteSettings): RawHtml {
  return html`
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-cta">
            <span class="eyebrow">Have a project in mind?</span>
            <p style="margin-top: var(--space-3)">
              <a class="link-underline" href="/contact" data-cursor="link"
                >Let's talk →</a
              >
            </p>
          </div>
          <div class="footer-col">
            <h3>Menu</h3>
            <ul>
              <li>
                <a class="link-underline" href="/work"
                  >${settings.navLabels.work ?? "Work"}</a
                >
              </li>
              <li>
                <a class="link-underline" href="/about"
                  >${settings.navLabels.about ?? "About"}</a
                >
              </li>
              <li>
                <a class="link-underline" href="/playground"
                  >${settings.navLabels.playground ?? "Playground"}</a
                >
              </li>
              <li>
                <a class="link-underline" href="/contact"
                  >${settings.navLabels.contact ?? "Contact"}</a
                >
              </li>
            </ul>
          </div>
          <div class="footer-col">
            <h3>Elsewhere</h3>
            <ul>
              ${settings.socialLinks.map(
                (s) =>
                  html`<li>
                    <a
                      class="link-underline"
                      href="${s.url}"
                      target="_blank"
                      rel="noopener noreferrer"
                      >${s.label}</a
                    >
                  </li>`,
              )}
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span
            >© ${currentYear()} ${settings.siteTitle}.
            ${settings.footerText}</span
          >
          <span
            >${settings.location} ·
            <span class="clock" data-clock data-timezone="${settings.timezone}"
              >--:--</span
            ></span
          >
          <span
            style="display:inline-flex; gap: var(--space-4); align-items:center"
          >
            ${
              settings.audioEnabled
                ? html`<button
                    class="audio-toggle"
                    type="button"
                    data-audio-toggle
                    aria-pressed="false"
                  >
                    <span class="bars"
                      ><span></span><span></span><span></span
                    ></span>
                    Sound
                  </button>`
                : ""
            }
            <button class="back-to-top" type="button" data-back-to-top>
              Back to top ↑
            </button>
          </span>
        </div>
      </div>
    </footer>
  `;
}
