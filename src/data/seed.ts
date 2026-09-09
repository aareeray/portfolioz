/**
 * Seed the database with self-authored placeholder content and generated media.
 * Idempotent: clears content tables first, then re-inserts. Also bootstraps the
 * first admin user from ADMIN_EMAIL / ADMIN_PASSWORD if none exists.
 */
import { getDb, runMigrations } from "../lib/db.ts";
import {
  createProject,
  addProjectMedia,
  createPlayground,
  saveSettings,
  createAdmin,
  countAdmins,
} from "./repo.ts";
import { defaultSettings } from "./defaultSettings.ts";
import {
  generateCover,
  generateGallery,
  generateOgImage,
} from "./generateMedia.ts";
import { hashPassword } from "../lib/auth.ts";
import { config } from "../config.ts";
import { logger } from "../lib/logger.ts";

interface SeedProject {
  slug: string;
  title: string;
  subtitle: string;
  client: string;
  year: number;
  category: string;
  role: string;
  shortDescription: string;
  description: string;
  featured: boolean;
  accentColor: string;
  externalUrl?: string;
  galleryCount: number;
}

const PROJECTS: SeedProject[] = [
  {
    slug: "meridian-identity",
    title: "Meridian",
    subtitle: "A living identity for a maritime research institute",
    client: "Meridian Institute",
    year: 2025,
    category: "Brand / Digital",
    role: "Art Direction, Identity, Web",
    shortDescription:
      "A flexible identity system anchored by a responsive compass mark.",
    description:
      "Meridian needed an identity as adaptable as the tides it studies. We built a system around a compass mark that rotates with context, paired with a restrained editorial typography scale and a deep-sea palette. The website foregrounds their research through large-scale imagery and quiet, purposeful motion.",
    featured: true,
    accentColor: "#2f6f8f",
    galleryCount: 3,
  },
  {
    slug: "northlight-festival",
    title: "Northlight",
    subtitle: "Wayfinding and digital presence for an arctic light festival",
    client: "Northlight Festival",
    year: 2025,
    category: "Identity / Motion",
    role: "Design System, Motion, Build",
    shortDescription:
      "An aurora-inspired system that shifts with the programme.",
    description:
      "For the Northlight Festival we designed a system that behaves like the aurora itself — gradients that drift, type that glows against darkness, and a schedule experience that feels alive. Motion was tuned to be atmospheric without ever getting in the way of information.",
    featured: true,
    accentColor: "#4b7a5a",
    galleryCount: 3,
  },
  {
    slug: "atlas-commerce",
    title: "Atlas & Co.",
    subtitle: "Commerce experience for a considered homeware label",
    client: "Atlas & Co.",
    year: 2024,
    category: "E-commerce / UI",
    role: "UX, UI, Front-end",
    shortDescription: "Slow commerce with generous imagery and honest pacing.",
    description:
      "Atlas & Co. make objects meant to last, so the store had to resist the usual urgency of e-commerce. We leaned into whitespace, oversized product photography, and micro-interactions that reward attention, producing a calm shopping experience that mirrors the products.",
    featured: true,
    accentColor: "#b06a3a",
    galleryCount: 4,
  },
  {
    slug: "cadence-app",
    title: "Cadence",
    subtitle: "Interface and motion language for a focus app",
    client: "Cadence",
    year: 2024,
    category: "Product / Motion",
    role: "Product Design, Prototyping",
    shortDescription: "A calm focus tool with breath-paced motion.",
    description:
      "Cadence helps people find flow, so every transition had to feel like an exhale. We defined a motion language built on gentle easing and honest timing, then prototyped it end-to-end to ensure the product felt as good as it looked.",
    featured: false,
    accentColor: "#6a5aa0",
    galleryCount: 2,
  },
  {
    slug: "verdant-report",
    title: "Verdant",
    subtitle: "An interactive annual report on regeneration",
    client: "Verdant Foundation",
    year: 2023,
    category: "Editorial / Data",
    role: "Art Direction, Data Viz, Build",
    shortDescription: "Data storytelling that grows as you scroll.",
    description:
      "Verdant's annual report needed to make ecological data feel hopeful and legible. We built a scroll-driven narrative where charts assemble in view and photography breathes between sections, turning a PDF-shaped obligation into an experience people actually finished.",
    featured: false,
    accentColor: "#3f8f6f",
    galleryCount: 3,
  },
  {
    slug: "halcyon-studio",
    title: "Halcyon",
    subtitle: "Portfolio and identity for an architecture studio",
    client: "Halcyon Studio",
    year: 2023,
    category: "Brand / Web",
    role: "Identity, Web, Motion",
    shortDescription: "Architectural calm expressed through grid and light.",
    description:
      "Halcyon's work is about light and proportion, so their portfolio became an exercise in the same. A strict grid, hairline rules, and slow cross-fades let the architecture speak while the interface stays deferential.",
    featured: false,
    accentColor: "#8a7d5a",
    galleryCount: 3,
  },
];

interface SeedPlayground {
  slug: string;
  title: string;
  description: string;
  type: "canvas" | "video" | "image" | "interactive" | "embed";
  accent: string;
}

const PLAYGROUND: SeedPlayground[] = [
  {
    slug: "grid-drift",
    title: "Grid Drift",
    description: "A responsive grid that reacts to the cursor.",
    type: "interactive",
    accent: "#c8542b",
  },
  {
    slug: "type-in-motion",
    title: "Type in Motion",
    description: "Variable-font weight interpolation study.",
    type: "canvas",
    accent: "#2f6f8f",
  },
  {
    slug: "noise-fields",
    title: "Noise Fields",
    description: "Flow-field particles rendered on canvas.",
    type: "canvas",
    accent: "#4b7a5a",
  },
  {
    slug: "hover-toy",
    title: "Hover Toy",
    description: "Magnetic hover micro-interaction.",
    type: "interactive",
    accent: "#6a5aa0",
  },
  {
    slug: "loop-01",
    title: "Loop 01",
    description: "Seamless geometric loop.",
    type: "image",
    accent: "#b06a3a",
  },
  {
    slug: "aurora-shader",
    title: "Aurora",
    description: "Layered gradient motion study.",
    type: "image",
    accent: "#3f8f6f",
  },
];

export function seed(): void {
  runMigrations();
  const db = getDb();

  logger.info("seed.start");
  db.exec(
    "DELETE FROM project_media; DELETE FROM projects; DELETE FROM playground_items;",
  );
  // reset autoincrement counters for deterministic ids
  db.exec(
    "DELETE FROM sqlite_sequence WHERE name IN ('projects','project_media','playground_items');",
  );

  generateOgImage(defaultSettings.siteTitle);

  PROJECTS.forEach((p, i) => {
    const hero = generateCover({
      name: `${p.slug}-hero.svg`,
      label: p.title,
      accent: p.accentColor,
      width: 1600,
      height: 1000,
      index: i,
    });
    const thumb = generateCover({
      name: `${p.slug}-thumb.svg`,
      label: p.title,
      accent: p.accentColor,
      width: 1200,
      height: 900,
      index: i + 1,
    });
    const id = createProject({
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle,
      client: p.client,
      year: p.year,
      category: p.category,
      role: p.role,
      description: p.description,
      shortDescription: p.shortDescription,
      featured: p.featured,
      published: true,
      sortOrder: i,
      heroImage: hero,
      thumbnailImage: thumb,
      accentColor: p.accentColor,
      externalUrl: p.externalUrl ?? null,
    });
    // Hero as first media, then gallery frames.
    addProjectMedia(id, {
      type: "image",
      src: hero,
      alt: `${p.title} — hero`,
      width: 1600,
      height: 1000,
      sortOrder: 0,
    });
    for (let g = 0; g < p.galleryCount; g += 1) {
      const src = generateGallery(`${p.slug}-g${g + 1}.svg`, p.accentColor, g);
      addProjectMedia(id, {
        type: "image",
        src,
        alt: `${p.title} — image ${g + 1}`,
        caption: g === 0 ? "System overview" : null,
        width: 1600,
        height: 1000,
        sortOrder: g + 1,
      });
    }
  });

  PLAYGROUND.forEach((item, i) => {
    const thumb = generateCover({
      name: `pg-${item.slug}.svg`,
      label: item.title,
      accent: item.accent,
      width: 1000,
      height: 1000,
      index: i + 10,
    });
    createPlayground({
      slug: item.slug,
      title: item.title,
      description: item.description,
      type: item.type,
      thumbnail: thumb,
      media: thumb,
      published: true,
      sortOrder: i,
    });
  });

  saveSettings(defaultSettings);

  // Bootstrap admin
  if (countAdmins() === 0) {
    if (config.admin.password && config.admin.password.length >= 6) {
      createAdmin(config.admin.email, hashPassword(config.admin.password));
      logger.info("seed.admin.created", { email: config.admin.email });
    } else {
      // Dev fallback so /admin is usable immediately. Documented in README.
      const devPassword = "admin1234";
      createAdmin(config.admin.email, hashPassword(devPassword));
      logger.warn("seed.admin.devFallback", {
        email: config.admin.email,
        note: "Set ADMIN_PASSWORD to override. Dev password: admin1234",
      });
    }
  }

  logger.info("seed.done", {
    projects: PROJECTS.length,
    playground: PLAYGROUND.length,
  });
}
