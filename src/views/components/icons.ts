/** Inline SVG icons (self-authored). Return RawHtml. */
import { html, raw } from "../../lib/html.ts";
import type { RawHtml } from "../../lib/html.ts";

export const icons = {
  arrow(): RawHtml {
    return html`<svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 9h10M9.5 4.5 14 9l-4.5 4.5"
        stroke="currentColor"
        stroke-width="1.4"
      />
    </svg>`;
  },
  arrowUpRight(): RawHtml {
    return html`<svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M5 11 11 5M6 5h5v5" stroke="currentColor" stroke-width="1.4" />
    </svg>`;
  },
  plus(): RawHtml {
    return html`<svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path d="M9 3v12M3 9h12" stroke="currentColor" stroke-width="1.4" />
    </svg>`;
  },
  menu(): RawHtml {
    return raw(
      `<svg width="22" height="10" viewBox="0 0 22 10" fill="none" aria-hidden="true"><path d="M0 1h22M0 9h22" stroke="currentColor" stroke-width="1.4"/></svg>`,
    );
  },
};
