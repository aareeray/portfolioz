import type { SiteSettings } from "../types/index.ts";

/**
 * Site configuration and content for Huy Phan (Huyml.co).
 */
export const defaultSettings: SiteSettings = {
  siteTitle: "Huy Phan - Award-winning designer",
  description:
    "Huy Phan (Huyml) is an award-winning designer and art director based in Ho Chi Minh city, Vietnam.",
  location: "HCMC, Vietnam",
  timezone: "Asia/Ho_Chi_Minh",
  email: "hello@huyml.co",
  phone: "+84",
  availability: "Available for select projects in 2026",
  socialLinks: [
    { label: "YouTube", url: "https://www.youtube.com/@huyml.studio" },
    { label: "Behance", url: "https://www.behance.net/huyphan2602" },
    { label: "Dribbble", url: "https://dribbble.com/huyphan2602" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/huy-phan-086023a5/" },
    { label: "Instagram", url: "https://www.instagram.com/huy.phan.2602" },
    { label: "Facebook", url: "https://www.facebook.com/phan.huy.2602" },
    { label: "Unsplash", url: "https://unsplash.com/@huyphan2602" },
    { label: "Pexels", url: "https://www.pexels.com/@huy-phan-316220/" },
  ],
  resumeUrl: null,
  showreelUrl: "https://player.vimeo.com/video/1041162444",
  audioEnabled: true,
  navLabels: {
    work: "WORK",
    about: "ABOUT",
    playground: "PLAYGROUND",
    contact: "CONTACT",
  },
  footerText: "HUYML© copyright 2026 · Ho Chi Minh City, Vietnam",
  intro:
    "Shaping digital experiences with clarity, intention, character, and being a good friend with digital agencies, design studios, startups, and businesses around the world since 2018.",
  bio: [
    "Plant Daddy · Gooner since the Invincibles · Married to a beautiful knitter · 3 cats call him dad · BlackBerry Collector · Pool Player but Chicken level · into watches now...",
    "Shaping digital experiences with clarity, intention, character and being a good friend with digital agencies, design studios, startups and businesses around the world since 2018.",
  ],
  capabilities: [
    {
      title: "Core",
      items: [
        "Digital Art Direction",
        "Website Design",
        "Application Design",
        "Interactive Storytelling",
      ],
    },
    {
      title: "Motion & Craft",
      items: [
        "Website Motion & Animation",
        "Design System",
        "User Experience",
        "Process & Approach",
      ],
    },
  ],
  process: [
    {
      index: 1,
      title: "Discover & Frame",
      description: "Getting deep into the brand story, vision, and core purpose.",
    },
    {
      index: 2,
      title: "Art Direction & System",
      description: "Defining typography, motion pacing, and visual character.",
    },
    {
      index: 3,
      title: "Interactive Craft",
      description: "Prototyping fluid transitions, micro-interactions, and 3D moments.",
    },
    {
      index: 4,
      title: "Execution & Polish",
      description: "Delivering award-winning performance, accessibility, and fidelity.",
    },
  ],
  clients: [
    "Unilever",
    "VinPearl",
    "Autonomous",
    "Soravia",
    "NanoTemper",
    "Arvid Nordquist",
    "Soluis Group",
    "Klingit",
    "ToyFight",
    "Stockfiller",
    "Serious Business",
  ],
};
