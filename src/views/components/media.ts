import { html, classes } from "../../lib/html.ts";
import type { RawHtml } from "../../lib/html.ts";
import type { ProjectMedia } from "../../types/index.ts";

export interface SmartImageOpts {
  src: string;
  alt: string;
  width?: number | null;
  height?: number | null;
  className?: string;
  reveal?: boolean;
  loading?: "lazy" | "eager";
  sizes?: string;
}

/** SmartImage: lazy by default, dimensioned to avoid layout shift, reveal-aware. */
export function smartImage(opts: SmartImageOpts): RawHtml {
  const loading = opts.loading ?? "lazy";
  return html`<div
    class="${classes("media", opts.className)}"
    ${opts.reveal !== false ? html`data-reveal` : ""}
    ${opts.width && opts.height ? html`style="aspect-ratio:${opts.width} / ${opts.height}"` : ""}
  >
    <img
      src="${opts.src}"
      alt="${opts.alt}"
      loading="${loading}"
      decoding="async"
      ${opts.width ? html`width="${opts.width}"` : ""}
      ${opts.height ? html`height="${opts.height}"` : ""}
      ${opts.sizes ? html`sizes="${opts.sizes}"` : ""}
    />
  </div>`;
}

/** SmartVideo with poster + graceful fallback. */
export function smartVideo(opts: {
  src: string;
  poster?: string | null;
  alt: string;
  className?: string;
}): RawHtml {
  return html`<div class="${classes("media", opts.className)}" data-reveal>
    <video
      data-smart-video
      preload="none"
      muted
      loop
      playsinline
      ${opts.poster ? html`poster="${opts.poster}"` : ""}
      aria-label="${opts.alt}"
    >
      <source data-src="${opts.src}" type="video/mp4" />
    </video>
  </div>`;
}

/** Render project media (image/video/gallery) uniformly. */
export function renderProjectMedia(
  m: ProjectMedia,
  className?: string,
): RawHtml {
  if (m.type === "video") {
    return smartVideo({ src: m.src, poster: m.poster, alt: m.alt, className });
  }
  return smartImage({
    src: m.src,
    alt: m.alt,
    width: m.width,
    height: m.height,
    className,
  });
}
