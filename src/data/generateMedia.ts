/**
 * Generates self-authored SVG placeholder media into `public/media`.
 * No third-party or reference assets are used — everything here is drawn with
 * primitives so the UI looks complete after `npm run db:seed`.
 */
import fs from "node:fs";
import path from "node:path";
import { config } from "../config.ts";

const MEDIA_DIR = path.join(config.publicDir, "media");

function ensureDir(): void {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

function write(name: string, svg: string): string {
  ensureDir();
  fs.writeFileSync(path.join(MEDIA_DIR, name), svg.trim() + "\n", "utf8");
  return `/media/${name}`;
}

/** Deterministic pseudo-random from a string seed (stable across runs). */
function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const clamp = (x: number) => Math.max(0, Math.min(255, Math.round(x)));
  const r = clamp(((n >> 16) & 255) + amount);
  const g = clamp(((n >> 8) & 255) + amount);
  const b = clamp((n & 255) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

interface CoverOpts {
  name: string;
  label: string;
  accent: string;
  width: number;
  height: number;
  index: number;
}

/** A refined editorial cover: soft gradient, geometric marks, project label. */
export function generateCover(opts: CoverOpts): string {
  const rand = seeded(opts.name + opts.index);
  const { width: w, height: h, accent } = opts;
  const bg = shade(accent, -46);
  const bg2 = shade(accent, -18);
  const line = shade(accent, 40);

  const shapes: string[] = [];
  const variant = opts.index % 3;
  if (variant === 0) {
    const cx = w * (0.3 + rand() * 0.4);
    const cy = h * (0.35 + rand() * 0.3);
    const r = Math.min(w, h) * (0.22 + rand() * 0.12);
    shapes.push(
      `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="none" stroke="${line}" stroke-width="1.5" opacity="0.5"/>`,
    );
    shapes.push(
      `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(r * 0.6).toFixed(0)}" fill="${accent}" opacity="0.22"/>`,
    );
  } else if (variant === 1) {
    const gx = w * 0.18;
    for (let i = 0; i < 5; i += 1) {
      const x = gx + i * (w * 0.16);
      shapes.push(
        `<line x1="${x.toFixed(0)}" y1="${(h * 0.2).toFixed(0)}" x2="${x.toFixed(0)}" y2="${(h * 0.8).toFixed(0)}" stroke="${line}" stroke-width="1" opacity="0.35"/>`,
      );
    }
    shapes.push(
      `<rect x="${(w * 0.34).toFixed(0)}" y="${(h * 0.34).toFixed(0)}" width="${(w * 0.32).toFixed(0)}" height="${(h * 0.32).toFixed(0)}" fill="${accent}" opacity="0.25" transform="rotate(12 ${(w / 2).toFixed(0)} ${(h / 2).toFixed(0)})"/>`,
    );
  } else {
    const pts: string[] = [];
    for (let i = 0; i <= 6; i += 1) {
      const x = (w / 6) * i;
      const y = h * (0.55 + Math.sin(i + rand()) * 0.12);
      pts.push(`${x.toFixed(0)},${y.toFixed(0)}`);
    }
    shapes.push(
      `<polyline points="${pts.join(" ")}" fill="none" stroke="${line}" stroke-width="2" opacity="0.55"/>`,
    );
    shapes.push(
      `<circle cx="${(w * 0.5).toFixed(0)}" cy="${(h * 0.4).toFixed(0)}" r="${(Math.min(w, h) * 0.16).toFixed(0)}" fill="${accent}" opacity="0.2"/>`,
    );
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${opts.label}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg}"/>
      <stop offset="1" stop-color="${bg2}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  ${shapes.join("\n  ")}
  <text x="${(w * 0.06).toFixed(0)}" y="${(h * 0.9).toFixed(0)}" font-family="Georgia, 'Times New Roman', serif" font-size="${Math.round(h * 0.07)}" fill="#f4f1ea" opacity="0.92">${opts.label}</text>
</svg>`;
  return write(opts.name, svg);
}

/** A generic gallery frame (slightly different composition). */
export function generateGallery(
  name: string,
  accent: string,
  index: number,
  w = 1600,
  h = 1000,
): string {
  const bg = shade(accent, -52);
  const bar = shade(accent, 30);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Gallery frame ${index}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <rect x="${w * 0.1}" y="${h * 0.14}" width="${w * 0.8}" height="${h * 0.72}" fill="none" stroke="${bar}" stroke-width="1" opacity="0.4"/>
  <rect x="${w * 0.1}" y="${h * (0.5 + (index % 2) * 0.08)}" width="${w * 0.8}" height="2" fill="${accent}" opacity="0.5"/>
  <circle cx="${w * (0.3 + (index % 3) * 0.2)}" cy="${h * 0.5}" r="${Math.min(w, h) * 0.14}" fill="${accent}" opacity="0.18"/>
</svg>`;
  return write(name, svg);
}

/** OG social preview image. */
export function generateOgImage(title: string, accent = "#c8542b"): string {
  const w = 1200;
  const h = 630;
  const bg = shade(accent, -50);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${title}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <circle cx="${w * 0.82}" cy="${h * 0.28}" r="200" fill="${accent}" opacity="0.22"/>
  <text x="80" y="${h * 0.52}" font-family="Georgia, serif" font-size="76" fill="#f4f1ea">${title}</text>
  <text x="80" y="${h * 0.66}" font-family="Georgia, serif" font-size="30" fill="#f4f1ea" opacity="0.7">Independent design &amp; interaction studio</text>
</svg>`;
  return write("og-default.svg", svg);
}

export function mediaDir(): string {
  return MEDIA_DIR;
}
