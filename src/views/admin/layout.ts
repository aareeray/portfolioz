import { html, raw } from "../../lib/html.ts";
import type { RawHtml } from "../../lib/html.ts";

/** Minimal, functional admin shell — intentionally utilitarian (not the public design). */
export function renderAdminPage(opts: {
  title: string;
  body: RawHtml;
  email?: string;
  newMessages?: number;
  active?: string;
}): string {
  const nav: Array<[string, string]> = [
    ["Dashboard", "/admin"],
    ["Projects", "/admin/projects"],
    ["Playground", "/admin/playground"],
    ["Messages", "/admin/messages"],
    ["Settings", "/admin/settings"],
  ];
  return (
    "<!doctype html>" +
    html`
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="robots" content="noindex, nofollow" />
          <title>${opts.title} · Admin</title>
          <link rel="stylesheet" href="/styles/admin.css" />
        </head>
        <body class="admin">
          ${
            opts.email
              ? html`<header class="admin-header">
                  <a class="admin-brand" href="/admin">▲ Admin</a>
                  <nav class="admin-nav">
                    ${nav.map(
                      ([label, href]) =>
                        html`<a
                          href="${href}"
                          ${opts.active === href ? html`aria-current="page"` : ""}
                          >${label}${label === "Messages" && opts.newMessages ? html` <span class="badge">${opts.newMessages}</span>` : ""}</a
                        >`,
                    )}
                  </nav>
                  <form
                    method="post"
                    action="/admin/logout"
                    class="admin-logout"
                  >
                    <span class="admin-user">${opts.email}</span>
                    <button type="submit">Log out</button>
                  </form>
                </header>`
              : ""
          }
          <main class="admin-main">${opts.body}</main>
        </body>
      </html>
    `.value
  );
}

/** Flash message helper. */
export function flash(
  kind: "success" | "error",
  message: string | undefined,
): RawHtml {
  if (!message) return raw("");
  return html`<div class="flash flash--${kind}">${message}</div>`;
}
