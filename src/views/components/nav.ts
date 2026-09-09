import { html } from "../../lib/html.ts";
import type { RawHtml } from "../../lib/html.ts";
import { icons } from "./icons.ts";
import type { SiteSettings } from "../../types/index.ts";

const LINKS: Array<{ key: keyof SiteSettings["navLabels"]; href: string }> = [
  { key: "work", href: "/work" },
  { key: "about", href: "/about" },
  { key: "playground", href: "/playground" },
  { key: "contact", href: "/contact" },
];

export function renderHeader(
  settings: SiteSettings,
  currentPath: string,
): RawHtml {
  const label = (k: keyof SiteSettings["navLabels"]) =>
    settings.navLabels[k] ?? String(k);
  const isCurrent = (href: string) =>
    href === "/work" ? currentPath.startsWith("/work") : currentPath === href;

  return html`
    <header class="site-header" data-hidden="false">
      <div class="container">
        <a
          class="brand"
          href="/"
          data-cursor="link"
          aria-label="${settings.siteTitle} — home"
          >${settings.siteTitle}</a
        >
        <nav class="nav-desktop" aria-label="Primary">
          ${LINKS.map(
            (l) =>
              html`<a
                href="${l.href}"
                data-cursor="link"
                ${isCurrent(l.href) ? html`aria-current="page"` : ""}
                >${label(l.key)}</a
              >`,
          )}
        </nav>
        <button
          class="nav-toggle"
          type="button"
          aria-expanded="false"
          aria-controls="menu-overlay"
          data-menu-open
        >
          <span>Menu</span> ${icons.menu()}
        </button>
      </div>
    </header>

    <div
      class="menu-overlay"
      id="menu-overlay"
      data-open="false"
      aria-hidden="true"
    >
      <button
        class="menu-close"
        type="button"
        data-menu-close
        aria-label="Close menu"
      >
        Close
      </button>
      <nav aria-label="Mobile">
        ${LINKS.map((l) => html`<a href="${l.href}" data-menu-link>${label(l.key)}</a>`)}
      </nav>
      <div class="menu-meta">
        <span>${settings.location}</span>
        <span
          ><span class="clock" data-clock data-timezone="${settings.timezone}"
            >--:--</span
          ></span
        >
        <a class="link-underline" href="mailto:${settings.email}"
          >${settings.email}</a
        >
      </div>
    </div>
  `;
}
