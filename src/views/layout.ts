import { html, raw } from "../lib/html.ts";
import type { RawHtml } from "../lib/html.ts";
import { renderHeader } from "./components/nav.ts";
import { renderFooter } from "./components/footer.ts";
import { config } from "../config.ts";
import type { SiteSettings } from "../types/index.ts";

export interface Meta {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  type?: "website" | "article";
  jsonLd?: object;
}

export interface LayoutOptions {
  meta: Meta;
  settings: SiteSettings;
  body: RawHtml;
  /** Extra body classes, e.g. per-page hooks. */
  bodyClass?: string;
}

export function renderPage(opts: LayoutOptions): string {
  const { meta, settings, body } = opts;
  const canonical = `${config.siteUrl}${meta.path === "/" ? "" : meta.path}`;
  const ogImage = `${config.siteUrl}${meta.ogImage ?? "/media/og-default.svg"}`;
  const fullTitle =
    meta.path === "/"
      ? `${settings.siteTitle} — ${settings.description.split(".")[0]}`
      : `${meta.title} · ${settings.siteTitle}`;

  const jsonLd = meta.jsonLd ?? {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteTitle,
    url: config.siteUrl,
    description: settings.description,
  };

  return (
    "<!doctype html>" +
    html`
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${fullTitle}</title>
          <meta name="description" content="${meta.description}" />
          <link rel="canonical" href="${canonical}" />
          <meta name="theme-color" content="#0e0d0b" />

          <meta property="og:type" content="${meta.type ?? "website"}" />
          <meta property="og:site_name" content="${settings.siteTitle}" />
          <meta property="og:title" content="${meta.title}" />
          <meta property="og:description" content="${meta.description}" />
          <meta property="og:url" content="${canonical}" />
          <meta property="og:image" content="${ogImage}" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${meta.title}" />
          <meta name="twitter:description" content="${meta.description}" />
          <meta name="twitter:image" content="${ogImage}" />

          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="stylesheet" href="/styles/tokens.css" />
          <link rel="stylesheet" href="/styles/base.css" />
          <link rel="stylesheet" href="/styles/components.css" />
          <link rel="stylesheet" href="/styles/pages.css" />
          <script type="application/ld+json">
            ${raw(JSON.stringify(jsonLd))}
          </script>
          <script type="module" src="/js/main.mjs"></script>
        </head>
        <body class="${opts.bodyClass ?? ""}">
          <a class="skip-link" href="#main">Skip to content</a>
          <div class="page-transition" data-transition aria-hidden="true"></div>
          ${renderHeader(settings, meta.path)}
          <main id="main" data-barba="container">${body}</main>
          ${renderFooter(settings)}
          <div class="cursor" data-cursor-root aria-hidden="true">
            <span class="cursor__label" data-cursor-label>View</span>
          </div>
        </body>
      </html>
    `.value
  );
}
