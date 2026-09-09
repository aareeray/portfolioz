import { html } from "../lib/html.ts";
import { renderPage } from "./layout.ts";
import { getSettings } from "../data/repo.ts";
import { defaultSettings } from "../data/defaultSettings.ts";
import type { SiteSettings } from "../types/index.ts";

/** Standalone error/404 page. Falls back to default settings if the DB is unavailable. */
export function renderError(
  code: number,
  message: string,
  _authed = false,
): string {
  let settings: SiteSettings;
  try {
    settings = getSettings();
  } catch {
    settings = defaultSettings;
  }

  const body = html`
    <section class="error-page">
      <div class="container">
        <p class="eyebrow">${code === 404 ? "Not found" : "Error"}</p>
        <h1 class="error-code">${code}</h1>
        <p
          class="lead"
          style="margin: var(--space-4) auto 0; text-align:center"
        >
          ${message}
        </p>
        <p style="margin-top: var(--space-6)">
          <a class="btn" href="/">Back home</a>
        </p>
      </div>
    </section>
  `;

  return renderPage({
    settings,
    body,
    meta: {
      title: `${code}`,
      description: message,
      path: code === 404 ? "/404" : "/error",
    },
  });
}
