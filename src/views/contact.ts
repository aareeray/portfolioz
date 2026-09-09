import { html } from "../lib/html.ts";
import { renderPage } from "./layout.ts";
import type { SiteSettings } from "../types/index.ts";

export function renderContact(
  settings: SiteSettings,
  csrfToken: string,
): string {
  const body = html`
    <section class="contact-hero container">
      <p class="eyebrow" data-reveal>Contact</p>
      <h1 class="contact-headline" data-reveal style="--reveal-delay:60ms">
        Let's make something worth remembering.
      </h1>
    </section>

    <section class="contact-grid container">
      <div>
        <p class="eyebrow" style="margin-bottom: var(--space-4)">
          Write directly
        </p>
        <button
          class="copy-email"
          type="button"
          data-copy-email
          data-email="${settings.email}"
          data-cursor="link"
        >
          <span data-copy-text>${settings.email}</span>
          <span class="copy-hint" data-copy-hint>Click to copy</span>
        </button>

        <form
          class="contact-form"
          method="post"
          action="/api/contact"
          data-contact-form
          novalidate
          style="margin-top: var(--space-8)"
        >
          <input type="hidden" name="csrf" value="${csrfToken}" />
          <!-- Honeypot: bots fill this; humans never see it. -->
          <div class="visually-hidden" aria-hidden="true">
            <label for="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              tabindex="-1"
              autocomplete="off"
            />
          </div>

          <div class="field">
            <label for="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              autocomplete="name"
              data-cursor="link"
            />
            <span class="error" data-error-for="name"></span>
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autocomplete="email"
              data-cursor="link"
            />
            <span class="error" data-error-for="email"></span>
          </div>
          <div class="field">
            <label for="company"
              >Company
              <span style="text-transform:none">(optional)</span></label
            >
            <input
              type="text"
              id="company"
              name="company"
              autocomplete="organization"
              data-cursor="link"
            />
          </div>
          <div class="field">
            <label for="message">Project / Message</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              required
              data-cursor="link"
            ></textarea>
            <span class="error" data-error-for="message"></span>
          </div>
          <button class="btn" type="submit" data-cursor="link" data-submit>
            Send message
          </button>
          <p
            class="form-status"
            data-form-status
            role="status"
            aria-live="polite"
          ></p>
        </form>
      </div>

      <aside class="contact-aside">
        <div class="block">
          <h3>Availability</h3>
          <p>${settings.availability}</p>
        </div>
        <div class="block">
          <h3>Studio</h3>
          <p>${settings.location}</p>
          <p>
            <span class="clock" data-clock data-timezone="${settings.timezone}"
              >--:--</span
            >
            local time
          </p>
        </div>
        <div class="block">
          <h3>Elsewhere</h3>
          <ul class="social-list">
            ${settings.socialLinks.map(
              (s) =>
                html`<li>
                  <a
                    class="link-underline"
                    href="${s.url}"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="link"
                    >${s.label}</a
                  >
                </li>`,
            )}
          </ul>
        </div>
      </aside>
    </section>
  `;

  return renderPage({
    settings,
    body,
    bodyClass: "page-contact",
    meta: {
      title: "Contact",
      description: `Get in touch with ${settings.siteTitle}. ${settings.availability}`,
      path: "/contact",
    },
  });
}
