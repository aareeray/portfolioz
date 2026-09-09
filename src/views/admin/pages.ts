import { html, when } from "../../lib/html.ts";
import type { RawHtml } from "../../lib/html.ts";
import { renderAdminPage, flash } from "./layout.ts";
import type {
  Project,
  ProjectWithMedia,
  PlaygroundItem,
  ContactMessage,
  SiteSettings,
} from "../../types/index.ts";

function field(
  label: string,
  name: string,
  value: unknown,
  type = "text",
  extra: RawHtml = html``,
): RawHtml {
  return html`<label class="admin-field"
    ><span>${label}</span
    ><input type="${type}" name="${name}" value="${value ?? ""}" ${extra} />
  </label>`;
}

function textarea(
  label: string,
  name: string,
  value: unknown,
  rows = 4,
): RawHtml {
  return html`<label class="admin-field"
    ><span>${label}</span
    ><textarea name="${name}" rows="${rows}">${value ?? ""}</textarea>
  </label>`;
}

function checkbox(label: string, name: string, checked: boolean): RawHtml {
  return html`<label class="admin-check"
    ><input type="checkbox" name="${name}" ${checked ? html`checked` : ""} />
    ${label}</label
  >`;
}

/* ---------------------------------------------------------------- login */

export function renderLogin(csrf: string, error?: string): string {
  return renderAdminPage({
    title: "Login",
    body: html`
      <div class="admin-login">
        <h1>Admin</h1>
        ${flash("error", error)}
        <form method="post" action="/admin/login">
          <input type="hidden" name="csrf" value="${csrf}" />
          ${field("Email", "email", "", "email", html`required autocomplete="username"`)}
          ${field("Password", "password", "", "password", html`required autocomplete="current-password"`)}
          <button class="admin-btn" type="submit">Sign in</button>
        </form>
      </div>
    `,
  });
}

/* ------------------------------------------------------------ dashboard */

export function renderDashboard(
  email: string,
  stats: {
    projects: number;
    published: number;
    playground: number;
    messages: number;
    newMessages: number;
  },
): string {
  return renderAdminPage({
    title: "Dashboard",
    email,
    active: "/admin",
    newMessages: stats.newMessages,
    body: html`
      <h1>Dashboard</h1>
      <div class="admin-stats">
        <a class="stat" href="/admin/projects"
          ><span class="stat__n">${stats.projects}</span
          ><span>Projects (${stats.published} published)</span></a
        >
        <a class="stat" href="/admin/playground"
          ><span class="stat__n">${stats.playground}</span
          ><span>Playground items</span></a
        >
        <a class="stat" href="/admin/messages"
          ><span class="stat__n">${stats.messages}</span
          ><span>Messages (${stats.newMessages} new)</span></a
        >
      </div>
      <p class="admin-hint">
        Content changes appear immediately on the public site.
      </p>
    `,
  });
}

/* ------------------------------------------------------------- projects */

export function renderProjectList(
  email: string,
  newMessages: number,
  projects: Project[],
  csrf: string,
  flashMsg?: string,
): string {
  return renderAdminPage({
    title: "Projects",
    email,
    newMessages,
    active: "/admin/projects",
    body: html`
      <div class="admin-head">
        <h1>Projects</h1>
        <a class="admin-btn" href="/admin/projects/new">New project</a>
      </div>
      ${flash("success", flashMsg)}
      <table class="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Year</th>
            <th>Featured</th>
            <th>Published</th>
            <th>Order</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${projects.map(
            (p) =>
              html`<tr>
                <td>
                  <a href="/admin/projects/${p.id}">${p.title}</a><br /><span
                    class="admin-mono"
                    >/${p.slug}</span
                  >
                </td>
                <td>${p.category ?? ""}</td>
                <td>${p.year ?? ""}</td>
                <td>${p.featured ? "★" : "—"}</td>
                <td>${p.published ? "●" : "○"}</td>
                <td>${p.sortOrder}</td>
                <td>
                  <form
                    method="post"
                    action="/admin/projects/${p.id}/delete"
                    onsubmit="return confirm('Delete ${p.title}?')"
                  >
                    <input type="hidden" name="csrf" value="${csrf}" />
                    <button class="admin-link-danger" type="submit">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>`,
          )}
        </tbody>
      </table>
    `,
  });
}

export function renderProjectForm(
  email: string,
  newMessages: number,
  csrf: string,
  project: ProjectWithMedia | null,
  flashMsg?: string,
): string {
  const p = project;
  const isNew = !p;
  return renderAdminPage({
    title: isNew ? "New project" : `Edit ${p!.title}`,
    email,
    newMessages,
    active: "/admin/projects",
    body: html`
      <div class="admin-head">
        <h1>${isNew ? "New project" : `Edit: ${p!.title}`}</h1>
        <a href="/admin/projects">← Back</a>
      </div>
      ${flash("success", flashMsg)}
      <form
        method="post"
        action="${isNew ? "/admin/projects" : `/admin/projects/${p!.id}`}"
        class="admin-form"
      >
        <input type="hidden" name="csrf" value="${csrf}" />
        <div class="admin-grid-2">
          ${field("Title", "title", p?.title, "text", html`required`)}
          ${field("Slug (auto if blank)", "slug", p?.slug)}
          ${field("Subtitle", "subtitle", p?.subtitle)}
          ${field("Client", "client", p?.client)}
          ${field("Year", "year", p?.year, "number")}
          ${field("Category", "category", p?.category)}
          ${field("Role", "role", p?.role)}
          ${field("Sort order", "sortOrder", p?.sortOrder ?? 0, "number")}
          ${field("Accent color", "accentColor", p?.accentColor ?? "#c8542b", "text")}
          ${field("Hero image URL", "heroImage", p?.heroImage)}
          ${field("Thumbnail URL", "thumbnailImage", p?.thumbnailImage)}
          ${field("Hero video URL", "heroVideo", p?.heroVideo)}
          ${field("External URL", "externalUrl", p?.externalUrl)}
          ${field("Case study URL", "caseStudyUrl", p?.caseStudyUrl)}
        </div>
        ${textarea("Short description", "shortDescription", p?.shortDescription, 2)}
        ${textarea("Description", "description", p?.description, 6)}
        <div class="admin-checks">
          ${checkbox("Featured", "featured", p?.featured ?? false)}
          ${checkbox("Published", "published", p?.published ?? true)}
        </div>
        <button class="admin-btn" type="submit">
          ${isNew ? "Create" : "Save changes"}
        </button>
      </form>

      ${when(
        !isNew,
        () => html`
          <section class="admin-media">
            <h2>Media</h2>
            <ul class="admin-media-list">
              ${p!.media.map(
                (m) =>
                  html`<li>
                    <span class="admin-mono">[${m.type}]</span> ${m.src}
                    <form
                      method="post"
                      action="/admin/projects/${p!.id}/media/${m.id}/delete"
                      style="display:inline"
                    >
                      <input type="hidden" name="csrf" value="${csrf}" />
                      <button class="admin-link-danger" type="submit">
                        remove
                      </button>
                    </form>
                  </li>`,
              )}
            </ul>
            <form
              method="post"
              action="/admin/projects/${p!.id}/media"
              class="admin-inline-form"
            >
              <input type="hidden" name="csrf" value="${csrf}" />
              <select name="type">
                ${["image", "video", "embed", "animation", "rive", "gallery"].map((t) => html`<option value="${t}">${t}</option>`)}
              </select>
              <input
                type="text"
                name="src"
                placeholder="/media/...svg"
                required
              />
              <input type="text" name="alt" placeholder="alt text" />
              <input
                type="number"
                name="sortOrder"
                placeholder="order"
                value="0"
                style="width:80px"
              />
              <button class="admin-btn" type="submit">Add media</button>
            </form>
          </section>
        `,
      )}
    `,
  });
}

/* ----------------------------------------------------------- playground */

export function renderPlaygroundList(
  email: string,
  newMessages: number,
  items: PlaygroundItem[],
  csrf: string,
  flashMsg?: string,
): string {
  return renderAdminPage({
    title: "Playground",
    email,
    newMessages,
    active: "/admin/playground",
    body: html`
      <div class="admin-head">
        <h1>Playground</h1>
        <a class="admin-btn" href="/admin/playground/new">New item</a>
      </div>
      ${flash("success", flashMsg)}
      <table class="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Published</th>
            <th>Order</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${items.map(
            (it) =>
              html`<tr>
                <td><a href="/admin/playground/${it.id}">${it.title}</a></td>
                <td>${it.type}</td>
                <td>${it.published ? "●" : "○"}</td>
                <td>${it.sortOrder}</td>
                <td>
                  <form
                    method="post"
                    action="/admin/playground/${it.id}/delete"
                    onsubmit="return confirm('Delete?')"
                  >
                    <input type="hidden" name="csrf" value="${csrf}" /><button
                      class="admin-link-danger"
                      type="submit"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>`,
          )}
        </tbody>
      </table>
    `,
  });
}

export function renderPlaygroundForm(
  email: string,
  newMessages: number,
  csrf: string,
  item: PlaygroundItem | null,
  flashMsg?: string,
): string {
  const isNew = !item;
  return renderAdminPage({
    title: isNew ? "New playground item" : `Edit ${item!.title}`,
    email,
    newMessages,
    active: "/admin/playground",
    body: html`
      <div class="admin-head">
        <h1>${isNew ? "New item" : `Edit: ${item!.title}`}</h1>
        <a href="/admin/playground">← Back</a>
      </div>
      ${flash("success", flashMsg)}
      <form
        method="post"
        action="${isNew ? "/admin/playground" : `/admin/playground/${item!.id}`}"
        class="admin-form"
      >
        <input type="hidden" name="csrf" value="${csrf}" />
        <div class="admin-grid-2">
          ${field("Title", "title", item?.title, "text", html`required`)}
          ${field("Slug (auto if blank)", "slug", item?.slug)}
          <label class="admin-field"
            ><span>Type</span
            ><select name="type">
              ${["interactive", "canvas", "video", "image", "embed"].map((t) => html`<option value="${t}" ${item?.type === t ? html`selected` : ""}>${t}</option>`)}
            </select></label
          >
          ${field("Sort order", "sortOrder", item?.sortOrder ?? 0, "number")}
          ${field("Thumbnail URL", "thumbnail", item?.thumbnail)}
          ${field("Media URL", "media", item?.media)}
          ${field("External URL", "externalUrl", item?.externalUrl)}
        </div>
        ${textarea("Description", "description", item?.description, 3)}
        <div class="admin-checks">
          ${checkbox("Published", "published", item?.published ?? true)}
        </div>
        <button class="admin-btn" type="submit">
          ${isNew ? "Create" : "Save"}
        </button>
      </form>
    `,
  });
}

/* ------------------------------------------------------------- messages */

export function renderMessages(
  email: string,
  newMessages: number,
  messages: ContactMessage[],
  csrf: string,
): string {
  return renderAdminPage({
    title: "Messages",
    email,
    newMessages,
    active: "/admin/messages",
    body: html`
      <h1>Messages</h1>
      ${messages.length === 0 ? html`<p class="admin-hint">No messages yet.</p>` : ""}
      <div class="admin-messages">
        ${messages.map(
          (m) =>
            html`<article class="admin-message admin-message--${m.status}">
              <header>
                <strong>${m.name}</strong> &lt;${m.email}&gt;
                ${m.company ? html`· ${m.company}` : ""}
                <span class="admin-mono">${m.createdAt} · ${m.status}</span>
              </header>
              <p>${m.message}</p>
              <form
                method="post"
                action="/admin/messages/${m.id}/status"
                class="admin-inline-form"
              >
                <input type="hidden" name="csrf" value="${csrf}" />
                ${["new", "read", "archived"].map((s) => html`<button name="status" value="${s}" class="admin-link" ${m.status === s ? html`disabled` : ""}>${s}</button>`)}
              </form>
            </article>`,
        )}
      </div>
    `,
  });
}

/* ------------------------------------------------------------- settings */

export function renderSettings(
  email: string,
  newMessages: number,
  csrf: string,
  s: SiteSettings,
  flashMsg?: string,
): string {
  const socialText = s.socialLinks
    .map((l) => `${l.label} | ${l.url}`)
    .join("\n");
  const navText = Object.entries(s.navLabels)
    .map(([k, val]) => `${k} | ${val}`)
    .join("\n");
  return renderAdminPage({
    title: "Settings",
    email,
    newMessages,
    active: "/admin/settings",
    body: html`
      <div class="admin-head"><h1>Site settings</h1></div>
      ${flash("success", flashMsg)}
      <form method="post" action="/admin/settings" class="admin-form">
        <input type="hidden" name="csrf" value="${csrf}" />
        <div class="admin-grid-2">
          ${field("Site title", "siteTitle", s.siteTitle, "text", html`required`)}
          ${field("Email", "email", s.email, "email")}
          ${field("Location", "location", s.location)}
          ${field("Timezone (IANA)", "timezone", s.timezone)}
          ${field("Availability", "availability", s.availability)}
          ${field("Showreel URL", "showreelUrl", s.showreelUrl)}
          ${field("Resume URL", "resumeUrl", s.resumeUrl)}
        </div>
        ${textarea("Description", "description", s.description, 2)}
        ${textarea("Intro (About/Home)", "intro", s.intro, 3)}
        ${textarea("Footer text", "footerText", s.footerText, 2)}
        ${textarea("Social links (one per line: Label | URL)", "socialLinks", socialText, 5)}
        ${textarea("Nav labels (one per line: key | label)", "navLabels", navText, 5)}
        <div class="admin-checks">
          ${checkbox("Audio enabled", "audioEnabled", s.audioEnabled)}
        </div>
        <button class="admin-btn" type="submit">Save settings</button>
      </form>
      <p class="admin-hint">
        Bio, capabilities, process, and clients are seeded from defaults; extend
        this form or edit via the seed to change them.
      </p>
    `,
  });
}
