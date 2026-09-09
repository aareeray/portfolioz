import type { SiteSettings } from "../types/index.ts";

/**
 * Default, fully self-authored site content. This is the fallback used when the
 * settings row is absent and the base object the seed persists. All names/copy are
 * placeholder material — not taken from the reference site.
 */
export const defaultSettings: SiteSettings = {
  siteTitle: "Studio Nordwell",
  description:
    "Independent design & interaction studio. We craft editorial digital experiences for brands that care about the details.",
  location: "Hanoi, Vietnam",
  timezone: "Asia/Ho_Chi_Minh",
  email: "hello@studionordwell.example",
  phone: null,
  availability: "Available for new work — Q3 2026",
  socialLinks: [
    { label: "Instagram", url: "https://example.com/instagram" },
    { label: "Are.na", url: "https://example.com/arena" },
    { label: "LinkedIn", url: "https://example.com/linkedin" },
    { label: "Read.cv", url: "https://example.com/readcv" },
  ],
  resumeUrl: null,
  showreelUrl: null,
  audioEnabled: true,
  navLabels: {
    work: "Work",
    about: "About",
    playground: "Playground",
    contact: "Contact",
  },
  footerText: "Designed & built in-house. Recreation for study purposes.",
  intro:
    "I'm an independent designer working at the intersection of brand, product, and motion — building considered digital experiences from concept through to the last frame.",
  bio: [
    "Over the last decade I've partnered with founders, studios, and cultural institutions to shape identities and interfaces that feel intentional and quietly confident.",
    "My work favours restraint: strong typography, generous space, and motion that guides rather than decorates. I care about the moment a page loads, the weight of a hover, and the rhythm of a scroll.",
    "When I'm not designing, I'm collecting typefaces, tuning synths, and over-engineering my coffee.",
  ],
  capabilities: [
    {
      title: "Design",
      items: ["Art Direction", "Brand Identity", "UI / UX", "Design Systems"],
    },
    {
      title: "Motion",
      items: [
        "Interaction Design",
        "Prototyping",
        "Web Animation",
        "Showreels",
      ],
    },
    {
      title: "Build",
      items: [
        "Front-end Engineering",
        "Creative Development",
        "Performance",
        "Accessibility",
      ],
    },
  ],
  process: [
    {
      index: 1,
      title: "Discover",
      description:
        "Immersion, research, and framing the real problem before pixels.",
    },
    {
      index: 2,
      title: "Define",
      description:
        "Sharpening direction into principles, references, and a north star.",
    },
    {
      index: 3,
      title: "Design",
      description: "Systems, typography, and composition that carry the idea.",
    },
    {
      index: 4,
      title: "Prototype",
      description:
        "Motion and interaction studies to feel the thing, not just see it.",
    },
    {
      index: 5,
      title: "Build",
      description: "Robust, accessible, performant front-end craft.",
    },
    {
      index: 6,
      title: "Launch",
      description: "Polish, QA across devices, and a considered hand-off.",
    },
  ],
  clients: [
    "Meridian",
    "Northlight",
    "Atlas & Co.",
    "Cadence",
    "Verdant",
    "Halcyon",
    "Foundry",
    "Lumen",
  ],
};
