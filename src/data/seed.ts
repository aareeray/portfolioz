/**
 * Seed the database with the exact projects, media, and settings from huyml.co.
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
import { hashPassword } from "../lib/auth.ts";
import { config } from "../config.ts";
import { logger } from "../lib/logger.ts";

export interface HuymlProject {
  slug: string;
  title: string;
  subtitle: string;
  client: string;
  year: number;
  category: string;
  role: string;
  launchDate: string;
  shortDescription: string;
  description: string;
  featured: boolean;
  accentColor: string;
  cardImage: string;
  heroImage: string;
  swatches: string[];
  recognitions: string[];
  galleryImages: string[];
}

export const HUYML_PROJECTS: HuymlProject[] = [
  {
    slug: "dafi-tropicdane",
    title: "DAFI TROPICDANE",
    subtitle: "A minimal, Scandinavian-inspired website for DAFI",
    client: "DAFI Furniture",
    year: 2026,
    category: "Furniture",
    role: "Design Direction · Website Design",
    launchDate: "April 2026",
    shortDescription: "A minimal, Scandinavian-inspired website for DAFI, a Danish company specializing in high-quality indoor and outdoor furniture.",
    description: "A minimal, Scandinavian-inspired website for DAFI, a Danish company specializing in high-quality indoor and outdoor furniture. The visual direction balances spacious layout architecture with rich tactile product storytelling.",
    featured: true,
    accentColor: "#D68D64",
    cardImage: "/media/cards/card_1.jpg",
    heroImage: "/media/projects/dafi_1.png",
    swatches: ["#D68D64", "#302824", "#F4EDE6"],
    recognitions: [
      "Awwwards Site of the Day",
      "Awwwards Site of the Month Nominee",
      "CSS Design Awards Website of the Day",
      "FWA of the Day",
    ],
    galleryImages: [
      "/media/projects/dafi_2.jpg",
      "/media/projects/dafi_3.jpg",
      "/media/projects/dafi_4.jpg",
    ],
  },
  {
    slug: "district2-studio",
    title: "DISTRICT2 STUDIO",
    subtitle: "Designing the new website for District2",
    client: "District2 Studio",
    year: 2025,
    category: "Agency & Studio",
    role: "Website Design",
    launchDate: "October 2025",
    shortDescription: "Designing the new website for District2, the first studio I ever worked at and my very first creative website project.",
    description: "Designing the new website for District2, the first studio I ever worked at and my very first creative website project. We brought together kinetic layout shifts, editorial typography, and an attitude of unfiltered creative experimentation.",
    featured: true,
    accentColor: "#111111",
    cardImage: "/media/cards/card_2.jpg",
    heroImage: "/media/projects/district2-studio_1.png",
    swatches: ["#111111", "#888888", "#ECECEC"],
    recognitions: [
      "Awwwards Site of the Day",
      "Awwwards Site of the Month Nominee",
      "CSSDA Website of the Day",
      "CSSDA Website of the Month",
      "CSSDA Website of the Year Nominee",
    ],
    galleryImages: [
      "/media/projects/district2-studio_2.jpg",
      "/media/projects/district2-studio_3.jpg",
      "/media/projects/district2-studio_4.jpg",
    ],
  },
  {
    slug: "fromanother",
    title: "FROMANOTHER",
    subtitle: "A fresh website for the creative agency fromanother",
    client: "fromanother",
    year: 2024,
    category: "Agency & Studio",
    role: "Design Direction · Website Design",
    launchDate: "November 2024",
    shortDescription: "A fresh website for the creative agency fromanother, founded by two artists I've long admired, Vicki and Robin.",
    description: "A fresh website for the creative agency fromanother, founded by two artists I've long admired, Vicki and Robin. The site delivers immersive full-bleed audio-visual chapters with deep interactive pacing.",
    featured: true,
    accentColor: "#0052FF",
    cardImage: "/media/cards/card_3.jpg",
    heroImage: "/media/projects/fromanother_1.png",
    swatches: ["#0A1128", "#FFF8E7", "#0052FF"],
    recognitions: [
      "Awwwards Site of the Day",
      "CSSDA Website of the Day",
    ],
    galleryImages: [
      "/media/projects/fromanother_2.jpg",
      "/media/projects/fromanother_3.jpg",
      "/media/projects/fromanother_4.jpg",
    ],
  },
  {
    slug: "iventions",
    title: "IVENTIONS",
    subtitle: "Event agency digital experience based in Barcelona",
    client: "Iventions / Serious Business",
    year: 2024,
    category: "Promotional",
    role: "Website Design",
    launchDate: "October 2024",
    shortDescription: "Teamed up with the Serious Business agency to build a new website for Iventions, an event agency based in Barcelona.",
    description: "Teamed up with the Serious Business agency to build a new website for Iventions, an event agency based in Barcelona. High-energy layouts with fluid transitions capture the scale of architectural event experiences.",
    featured: true,
    accentColor: "#FF4D00",
    cardImage: "/media/cards/card_4.jpg",
    heroImage: "/media/projects/iventions_1.png",
    swatches: ["#FF4D00", "#1E1E1E", "#FFFFFF"],
    recognitions: [
      "Awwwards Site of the Day",
      "FWA of the Day",
      "CSSDA Website of the Day",
    ],
    galleryImages: [
      "/media/projects/iventions_2.jpg",
      "/media/projects/iventions_3.jpg",
      "/media/projects/iventions_4.jpg",
    ],
  },
  {
    slug: "won-j-you-studios",
    title: "WON J. YOU STUDIOS",
    subtitle: "A website for veteran designer Won J. You",
    client: "Won J. You",
    year: 2024,
    category: "Personal Brand",
    role: "Design Direction · Website Design",
    launchDate: "September 2024",
    shortDescription: "A website for Won J. You, a veteran designer and professor focused on training the next generation through coaching, education, and mentorship.",
    description: "This project was all about telling Won's story as he transitioned from a designer and studio founder into a dedicated educator. Clean editorial structure with candid photography.",
    featured: true,
    accentColor: "#222222",
    cardImage: "/media/cards/card_5.jpg",
    heroImage: "/media/projects/wonjyou_1.png",
    swatches: ["#222222", "#F0F0F0", "#FFCC00"],
    recognitions: [
      "Awwwards Site of the Day",
      "FWA of the Day",
      "CSSDA Website of the Day",
    ],
    galleryImages: [
      "/media/projects/wonjyou_2.jpg",
      "/media/projects/wonjyou_3.jpg",
      "/media/projects/wonjyou_4.jpg",
    ],
  },
  {
    slug: "miux-studio",
    title: "MIUX STUDIO",
    subtitle: "UX studio founded in Thailand",
    client: "MIUX Studio",
    year: 2025,
    category: "Agency & Studio",
    role: "Art Director · Design Direction · Design Lead",
    launchDate: "February 2025",
    shortDescription: "Translated Thai-born founder Nara's vision for her young UX studio into a digital experience.",
    description: "Translated Thai-born founder Nara's vision for her young UX studio into a digital experience. Dynamic motion, modular layouts, and an unapologetic visual presence.",
    featured: true,
    accentColor: "#1B2A4A",
    cardImage: "/media/cards/card_6.jpg",
    heroImage: "/media/projects/miuxstudio_1.png",
    swatches: ["#1B2A4A", "#537895", "#ECECEC"],
    recognitions: [
      "Awwwards Site of the Day",
      "FWA of the Day",
      "CSSDA Website of the Day",
    ],
    galleryImages: [
      "/media/projects/miuxstudio_2.jpg",
      "/media/projects/miuxstudio_3.jpg",
      "/media/projects/miuxstudio_4.jpg",
    ],
  },
  {
    slug: "mark-woodland",
    title: "MARK WOODLAND",
    subtitle: "Entrepreneur Mark Woodland's digital presence",
    client: "Mark Woodland",
    year: 2024,
    category: "Personal Brand",
    role: "Website Design",
    launchDate: "August 2024",
    shortDescription: "Working with the talented team at Uncommon Studio to reshape entrepreneur Mark Woodland's digital presence.",
    description: "Working with the talented team at Uncommon Studio to reshape entrepreneur Mark Woodland's digital presence. Fast-paced typographic hierarchy paired with thoughtful storytelling.",
    featured: true,
    accentColor: "#0D0D0D",
    cardImage: "/media/cards/card_7.jpg",
    heroImage: "/media/projects/markwoodland_1.png",
    swatches: ["#0D0D0D", "#EBEBEB", "#3A86FF"],
    recognitions: [
      "Awwwards Site of the Day",
      "CSSDA Website of the Day",
    ],
    galleryImages: [
      "/media/projects/markwoodland_2.jpg",
      "/media/projects/markwoodland_3.jpg",
      "/media/projects/markwoodland_4.jpg",
    ],
  },
  {
    slug: "eislab",
    title: "EISLAB",
    subtitle: "Digital identity for a German ice cream brand",
    client: "EISLAB Berlin",
    year: 2025,
    category: "Food & Beverage",
    role: "Art Director · Website Design · Showcase",
    launchDate: "January 2025",
    shortDescription: "Refreshed the digital identity for this German ice cream brand, transforming a more colorful and tasteful website experience.",
    description: "Refreshed the digital identity for this German ice cream brand, transforming a more colorful and tasteful website experience that pops with appetite-appeal and fluid curves.",
    featured: true,
    accentColor: "#FF5E7E",
    cardImage: "/media/cards/card_8.jpg",
    heroImage: "/media/projects/eislab_1.png",
    swatches: ["#FF5E7E", "#FFAAA6", "#FFFBEA"],
    recognitions: [
      "CSSDA Website of the Day",
      "Behance UI Gallery",
    ],
    galleryImages: [
      "/media/projects/eislab_2.jpg",
      "/media/projects/eislab_3.jpg",
      "/media/projects/eislab_4.jpg",
    ],
  },
  {
    slug: "mat-voyce",
    title: "MAT VOYCE",
    subtitle: "Moving work of legendary type designer Mat Voyce",
    client: "Mat Voyce",
    year: 2024,
    category: "Portfolio",
    role: "Art Director · Design Direction",
    launchDate: "May 2024",
    shortDescription: "A new home for the moving work of legendary type designer Mat Voyce, built to push the boundaries of creativity and performance.",
    description: "A new home for the moving work of legendary type designer Mat Voyce, built to push the boundaries of kinetic typography, interactive experimentation, and pure visual delight.",
    featured: true,
    accentColor: "#00FF66",
    cardImage: "/media/cards/card_9.png",
    heroImage: "/media/projects/mat-voyce_1.png",
    swatches: ["#000000", "#00FF66", "#FFFFFF"],
    recognitions: [
      "Awwwards Site of the Day",
      "Awwwards Site of the Month Nominee",
      "FWA of the Day",
      "CSSDA Website of the Day",
    ],
    galleryImages: [
      "/media/projects/mat-voyce_2.jpg",
      "/media/projects/mat-voyce_3.jpg",
      "/media/projects/mat-voyce_4.jpg",
    ],
  },
  {
    slug: "defiant",
    title: "DEFIANT",
    subtitle: "Clean, minimal venture capital brand",
    client: "Defiant Capital",
    year: 2024,
    category: "Venture Capital",
    role: "Website Design",
    launchDate: "January 2024",
    shortDescription: "A website designed to mirror the brand's minimal, clean identity and help them stand out from traditional VC firms.",
    description: "A website designed to mirror the brand's minimal, clean identity and help them stand out from traditional VC firms. Monochrome discipline with sharp typography.",
    featured: true,
    accentColor: "#0F0F0F",
    cardImage: "/media/cards/card_10.jpg",
    heroImage: "/media/projects/defiant_1.png",
    swatches: ["#0F0F0F", "#404040", "#FFFFFF"],
    recognitions: [
      "Awwwards Site of the Day",
      "FWA of the Day",
      "CSSDA Website of the Day",
    ],
    galleryImages: [
      "/media/projects/defiant_2.jpg",
      "/media/projects/defiant_3.jpg",
      "/media/projects/defiant_4.jpg",
    ],
  },
  {
    slug: "by-kin",
    title: "BY 'KIN",
    subtitle: "Manchester interior & brand studio",
    client: "Kin Studio",
    year: 2023,
    category: "Agency & Studio",
    role: "Art Director · Website Design",
    launchDate: "October 2023",
    shortDescription: "Crafted a playful digital experience for Manchester-based interior and brand studio kin, featuring the layout switch that reflect the studio's multifaceted personality.",
    description: "Crafted a playful digital experience for Manchester-based interior and brand studio kin, featuring the layout switch that reflect the studio's multifaceted personality.",
    featured: true,
    accentColor: "#D35400",
    cardImage: "/media/cards/card_11.jpg",
    heroImage: "/media/projects/by-kin_1.png",
    swatches: ["#D35400", "#F5EEF8", "#2C3E50"],
    recognitions: [
      "Awwwards Site of the Day",
      "FWA of the Day",
      "CSSDA Website of the Day",
    ],
    galleryImages: [
      "/media/projects/by-kin_2.png",
      "/media/projects/by-kin_3.png",
      "/media/projects/by-kin_4.jpg",
    ],
  },
  {
    slug: "serious-business",
    title: "SERIOUS BUSINESS",
    subtitle: "Delicious agency brand transformation",
    client: "Serious Business Munich",
    year: 2023,
    category: "Agency & Studio",
    role: "Website Design",
    launchDate: "September 2023",
    shortDescription: "Got a chance to help Serious Business transform their new brand into a website that is delicious and makes 'people want to lick'.",
    description: "Got a chance to help Serious Business transform their new brand into a website that is delicious and makes 'people want to lick'. Bold, tactile, and delightfully weird.",
    featured: true,
    accentColor: "#E74C3C",
    cardImage: "/media/cards/card_12.jpg",
    heroImage: "/media/projects/serious-business_1.png",
    swatches: ["#E74C3C", "#FADBD8", "#17202A"],
    recognitions: [
      "Awwwards Site of the Day",
      "FWA of the Day",
      "CSSDA Website of the Day",
    ],
    galleryImages: [
      "/media/projects/serious-business_2.png",
      "/media/projects/serious-business_3.jpg",
      "/media/projects/serious-business_4.png",
    ],
  },
  {
    slug: "uncommon-studio",
    title: "UNCOMMON STUDIO",
    subtitle: "Melbourne-based bespoke digital experience",
    client: "Uncommon Studio",
    year: 2023,
    category: "Agency & Studio",
    role: "Art Director · Website Design",
    launchDate: "February 2023",
    shortDescription: "Designed a bespoke digital experience for Uncommon, a Melbourne-based studio serving clients worldwide.",
    description: "Designed a bespoke digital experience for Uncommon, a Melbourne-based studio serving clients worldwide. Precision grid design with smooth architectural rhythm.",
    featured: true,
    accentColor: "#27AE60",
    cardImage: "/media/cards/card_13.jpg",
    heroImage: "/media/projects/uncommon-studio_1.png",
    swatches: ["#27AE60", "#D5F5E3", "#196F3D"],
    recognitions: [
      "FWA Site of the Day",
      "CSSDA Website of the Day",
      "Behance UI Gallery",
      "Webby Honoree",
    ],
    galleryImages: [
      "/media/projects/uncommon-studio_2.jpg",
      "/media/projects/uncommon-studio_3.jpg",
      "/media/projects/uncommon-studio_4.jpg",
    ],
  },
  {
    slug: "ascon-systems",
    title: "ASCON SYSTEMS",
    subtitle: "Next-generation industrial metaverse and computing",
    client: "ASCon Systems",
    year: 2022,
    category: "Corporate",
    role: "Website Design",
    launchDate: "October 2022",
    shortDescription: "Working with Serious Business to build a website for ASCon that stands out from the typical corporate template while staying clean and professional.",
    description: "Working with Serious Business to build a website for ASCon that stands out from the typical corporate template while staying clean and professional.",
    featured: true,
    accentColor: "#2980B9",
    cardImage: "/media/cards/card_14.jpg",
    heroImage: "/media/projects/ascon-system_1.png",
    swatches: ["#2980B9", "#EBF5FB", "#1B4F72"],
    recognitions: [
      "Webby Nominee",
      "Awwwards Site of the Day",
      "FWA of the Day",
      "CSSDA Website of the Day",
      "Behance UI Gallery",
    ],
    galleryImages: [
      "/media/projects/ascon-system_2.jpg",
      "/media/projects/ascon-system_3.jpg",
      "/media/projects/ascon-system_4.jpg",
    ],
  },
  {
    slug: "mathijs-hanenkamp",
    title: "MATHIJS HANENKAMP",
    subtitle: "Portrait & documentary photographer portfolio",
    client: "Mathijs Hanenkamp",
    year: 2022,
    category: "Photography",
    role: "Design Direction · Website Design",
    launchDate: "July 2022",
    shortDescription: "Bringing the vision and personality of portrait and documentary photographer Mathijs Hanenkamp into pixels by using smooth transitions to highlight his imagery.",
    description: "Bringing the vision and personality of portrait and documentary photographer Mathijs Hanenkamp into pixels by using smooth transitions to highlight his imagery.",
    featured: true,
    accentColor: "#34495E",
    cardImage: "/media/cards/card_15.jpg",
    heroImage: "/media/projects/mathijs-hanenkamp_1.png",
    swatches: ["#34495E", "#EAEDED", "#17202A"],
    recognitions: [
      "Awwwards Site of the Day",
      "FWA of the Day",
      "CSSDA Website of the Day",
    ],
    galleryImages: [
      "/media/projects/mathijs-hanenkamp_2.jpg",
      "/media/projects/mathijs-hanenkamp_3.png",
      "/media/projects/mathijs-hanenkamp_4.jpg",
    ],
  },
  {
    slug: "rly-network",
    title: "RLY NETWORK",
    subtitle: "Web3 ecosystem and developer protocol",
    client: "RLY Network",
    year: 2022,
    category: "Blockchain - Web3",
    role: "Website Design",
    launchDate: "May 2022",
    shortDescription: "Together with SB to create an outstanding website that showcases the RLY network's value and ecosystem and encourages developers to build with the RLY protocol.",
    description: "Together with SB to create an outstanding website that showcases the RLY network's value and ecosystem and encourages developers to build with the RLY protocol.",
    featured: true,
    accentColor: "#8E44AD",
    cardImage: "/media/cards/card_16.jpg",
    heroImage: "/media/projects/rly-network_1.png",
    swatches: ["#8E44AD", "#F4ECF7", "#512E5F"],
    recognitions: [
      "Awwwards Site of the Day",
      "FWA of the Day",
      "CSSDA Website of the Day",
      "Behance UI Gallery",
    ],
    galleryImages: [
      "/media/projects/rly-network_2.jpg",
      "/media/projects/rly-network_3.jpg",
      "/media/projects/rly-network_4.png",
    ],
  },
  {
    slug: "huyml-vol1",
    title: "HUYML VOL.1",
    subtitle: "My first ever portfolio in 2022",
    client: "Huy Phan",
    year: 2022,
    category: "Portfolio",
    role: "Art Director · Website Design · Showcase",
    launchDate: "February 2022",
    shortDescription: "My first ever portfolio in 2022. The one that completely changed my whole career.",
    description: "My first ever portfolio in 2022. The one that completely changed my whole career and connected me to incredible collaborators and studios worldwide.",
    featured: true,
    accentColor: "#FF3B30",
    cardImage: "/media/cards/card_17.jpg",
    heroImage: "/media/projects/huyml-2022_1.png",
    swatches: ["#FF3B30", "#FFFFFF", "#111111"],
    recognitions: [
      "CSSDA Website of the Day",
      "Behance UI Gallery",
    ],
    galleryImages: [
      "/media/projects/huyml-2022_2.png",
      "/media/projects/huyml-2022_3.png",
      "/media/projects/huyml-2022_4.jpg",
    ],
  },
  {
    slug: "bison-studio",
    title: "BISON STUDIO",
    subtitle: "Creative and award-winning studio identity",
    client: "Bison Studio",
    year: 2022,
    category: "Agency & Studio",
    role: "Website Design",
    launchDate: "February 2022",
    shortDescription: "New look and feel for Bison to reflect their vision and position them as a creative and award-winning studio.",
    description: "New look and feel for Bison to reflect their vision and position them as a creative and award-winning studio.",
    featured: false,
    accentColor: "#D4AC0D",
    cardImage: "/media/cards/card_18.jpg",
    heroImage: "/media/projects/bison-studio_1.png",
    swatches: ["#D4AC0D", "#FEF9E7", "#7D6608"],
    recognitions: [
      "Behance UI Gallery",
    ],
    galleryImages: [
      "/media/projects/bison-studio_2.jpg",
      "/media/projects/bison-studio_3.jpg",
      "/media/projects/bison-studio_4.jpg",
    ],
  },
  {
    slug: "est-populo",
    title: "EST POPULO",
    subtitle: "Bold digital experience for Swedish marketing agency",
    client: "Est Populo",
    year: 2022,
    category: "Agency & Studio",
    role: "Website Design",
    launchDate: "January 2022",
    shortDescription: "A bold digital experience for Est Populo, a Swedish marketing agency, balancing clean Scandinavian aesthetics with editorial-style typography.",
    description: "A bold digital experience for Est Populo, a Swedish marketing agency, balancing clean Scandinavian aesthetics with editorial-style typography.",
    featured: false,
    accentColor: "#16A085",
    cardImage: "/media/cards/card_19.jpg",
    heroImage: "/media/projects/est-populo_1.png",
    swatches: ["#16A085", "#E8F8F5", "#0E6251"],
    recognitions: [
      "Behance UI Gallery",
    ],
    galleryImages: [
      "/media/projects/est-populo_2.jpg",
      "/media/projects/est-populo_3.jpg",
      "/media/projects/est-populo_4.jpg",
    ],
  },
];

export function seed(): void {
  runMigrations();
  const db = getDb();

  logger.info("seed.start");

  db.exec("DELETE FROM project_media");
  db.exec("DELETE FROM projects");
  db.exec("DELETE FROM playground_items");

  HUYML_PROJECTS.forEach((p, idx) => {
    const projId = createProject({
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
      sortOrder: idx,
      heroImage: p.heroImage,
      heroVideo: null,
      thumbnailImage: p.cardImage,
      accentColor: p.accentColor,
      externalUrl: `https://huyml.co/project/${p.slug}`,
      caseStudyUrl: `/work/${p.slug}`,
    });

    // Add card & hero media
    addProjectMedia(projId, {
      type: "image",
      src: p.cardImage,
      alt: `${p.title} card view`,
      caption: null,
      sortOrder: 0,
      width: 1200,
      height: 900,
      poster: null,
    });

    p.galleryImages.forEach((img, gIdx) => {
      addProjectMedia(projId, {
        type: "image",
        src: img,
        alt: `${p.title} showcase detail ${gIdx + 1}`,
        caption: null,
        sortOrder: gIdx + 1,
        width: 1600,
        height: 1000,
        poster: null,
      });
    });
  });

  // Seed 83 playground items matching huyml.co playground counter
  for (let i = 1; i <= 83; i++) {
    const cardNum = ((i - 1) % 19) + 1;
    createPlayground({
      slug: `experiment-${i}`,
      title: `Motion Study #${i.toString().padStart(2, "0")}`,
      description: `Visual investigation into kinetic physics, typography weight shifts, and 3D surface depth.`,
      type: i % 3 === 0 ? "interactive" : i % 2 === 0 ? "video" : "image",
      thumbnail: `/media/cards/card_${cardNum}.jpg`,
      media: `/media/cards/card_${cardNum}.jpg`,
      externalUrl: "https://huyml.co/playground",
      published: true,
      sortOrder: i,
    });
  }

  saveSettings(defaultSettings);

  // First admin
  if (countAdmins() === 0) {
    const email = config.admin.email;
    const rawPass = config.admin.password || "admin1234";
    const hash = hashPassword(rawPass);
    createAdmin(email, hash);
    logger.info("seed.admin.created", { email });
  }

  logger.info("seed.done", {
    projects: HUYML_PROJECTS.length,
    playground: 83,
  });
}
