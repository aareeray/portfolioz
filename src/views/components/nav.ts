import { html, raw } from "../../lib/html.ts";
import type { RawHtml } from "../../lib/html.ts";
import type { SiteSettings } from "../../types/index.ts";

export function renderHeader(
  settings: SiteSettings,
  currentPath: string,
): RawHtml {
  const isWork = currentPath === "/" || currentPath.startsWith("/work");
  const isAbout = currentPath.startsWith("/about");
  const isPlayground = currentPath.startsWith("/playground");

  return html`
    <!-- Left vertical brand rail -->
    <aside class="left-rail" aria-label="Brand and location">
      <div class="left-rail__inner">
        <a class="brand-vert" href="/" aria-label="HUYML homepage">
          <span class="brand-title">HUYML<sup>©</sup></span>
          <span class="brand-sub">copyright 2026</span>
          <span class="brand-code">+84</span>
          <span class="brand-city">hcmc, vn</span>
        </a>
      </div>
    </aside>

    <!-- Top navigation bar -->
    <header class="top-nav" role="banner">
      <div class="top-nav__menu-block">
        <span class="menu-label">Menu</span>
        <nav class="nav-links" aria-label="Primary">
          <a class="nav-link ${isWork ? "is-active" : ""}" href="/">
            ${isWork ? "→ " : ""}WORK
          </a>
          <a class="nav-link ${isAbout ? "is-active" : ""}" href="/about">
            ${isAbout ? "→ " : ""}ABOUT
          </a>
          <a class="nav-link ${isPlayground ? "is-active" : ""}" href="/playground">
            ${isPlayground ? "→ " : ""}PLAYGROUND
          </a>
          <button class="nav-link nav-btn-contact" type="button" data-open-contact>
            CONTACT
          </button>
        </nav>
      </div>

      <div class="top-nav__center-block">
        <button class="audio-toggle" type="button" data-audio-toggle aria-label="Toggle background audio">
          <span class="audio-label">Audio <strong>Off</strong></span>
          <span class="audio-icon" aria-hidden="true">
            <span class="audio-bar"></span>
            <span class="audio-bar"></span>
            <span class="audio-bar"></span>
          </span>
        </button>

        <div class="working-globally">
          <span class="wg-label">Working globally</span>
          <span class="wg-time">
            HCMC, <span data-clock data-timezone="${settings.timezone}">--:--</span>
          </span>
        </div>
      </div>

      <div class="top-nav__right-block">
        <span class="inquiries-label">For inquiries</span>
        <a class="inquiries-email" href="mailto:${settings.email}">${settings.email}</a>
      </div>
    </header>

    <!-- Signature "COME SAY HI" dark contact modal overlay -->
    <div class="contact-modal-overlay" id="contact-modal" aria-hidden="true">
      <div class="contact-modal-backdrop" data-close-contact></div>
      <div class="contact-card" role="dialog" aria-modal="true" aria-labelledby="contact-heading">
        <h2 id="contact-heading" class="contact-card__title">COME SAY HI</h2>

        <div class="contact-card__group">
          <span class="contact-card__label">Drop me a line</span>
          <a class="contact-card__email" href="mailto:hello@huyml.co">hello@huyml.co</a>
        </div>

        <div class="contact-card__group">
          <span class="contact-card__label">Hear me yapping about design</span>
          <div class="contact-links-list">
            <a href="https://www.youtube.com/@huyml.studio" target="_blank" rel="noopener noreferrer">YouTube</a>
          </div>
        </div>

        <div class="contact-card__group">
          <span class="contact-card__label">More design stuff</span>
          <div class="contact-links-list">
            <a href="https://www.behance.net/huyphan2602" target="_blank" rel="noopener noreferrer">Behance</a>
            <a href="https://dribbble.com/huyphan2602" target="_blank" rel="noopener noreferrer">Dribbble</a>
          </div>
        </div>

        <div class="contact-card__group">
          <span class="contact-card__label">Design & life updates lately</span>
          <div class="contact-links-list">
            <a href="https://www.linkedin.com/in/huy-phan-086023a5/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://www.instagram.com/huy.phan.2602" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.facebook.com/phan.huy.2602" target="_blank" rel="noopener noreferrer">Facebook</a>
          </div>
        </div>

        <div class="contact-card__group">
          <span class="contact-card__label">Things I captured along the way</span>
          <div class="contact-links-list">
            <a href="https://unsplash.com/@huyphan2602" target="_blank" rel="noopener noreferrer">Unsplash</a>
            <a href="https://www.pexels.com/@huy-phan-316220/" target="_blank" rel="noopener noreferrer">Pexels</a>
          </div>
        </div>

        <button class="contact-card__close" type="button" data-close-contact aria-label="Close dialog">
          Close ✕
        </button>
      </div>
    </div>

    <!-- Showreel video modal player -->
    <div class="showreel-modal-overlay" id="showreel-modal" aria-hidden="true">
      <div class="showreel-modal-backdrop" data-close-showreel></div>
      <div class="showreel-player-container">
        <button class="showreel-close" type="button" data-close-showreel aria-label="Close showreel">✕</button>
        <div class="showreel-video-wrapper">
          <iframe
            src="https://player.vimeo.com/video/1041162444?autoplay=1&title=0&byline=0&portrait=0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
            title="Huy Phan Showreel"
          ></iframe>
        </div>
      </div>
    </div>
  `;
}
