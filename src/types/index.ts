/** Domain types shared across the app. Mirror the SQLite schema (see src/data/migrations.ts). */

export type MediaType =
  "image" | "video" | "embed" | "animation" | "rive" | "gallery";
export type MessageStatus = "new" | "read" | "archived";
export type PlaygroundType =
  "video" | "canvas" | "embed" | "image" | "interactive";

export interface ProjectMedia {
  id: number;
  projectId: number;
  type: MediaType;
  src: string;
  poster: string | null;
  alt: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  client: string | null;
  year: number | null;
  category: string | null;
  role: string | null;
  description: string | null;
  shortDescription: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  heroImage: string | null;
  heroVideo: string | null;
  thumbnailImage: string | null;
  accentColor: string | null;
  externalUrl: string | null;
  caseStudyUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithMedia extends Project {
  media: ProjectMedia[];
}

export interface PlaygroundItem {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  type: PlaygroundType;
  thumbnail: string | null;
  media: string | null;
  externalUrl: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  company: string | null;
  message: string;
  source: string | null;
  status: MessageStatus;
  createdAt: string;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface ProcessStep {
  index: number;
  title: string;
  description: string;
}

export interface Capability {
  title: string;
  items: string[];
}

export interface SiteSettings {
  siteTitle: string;
  description: string;
  location: string;
  timezone: string;
  email: string;
  phone: string | null;
  availability: string;
  socialLinks: SocialLink[];
  resumeUrl: string | null;
  showreelUrl: string | null;
  audioEnabled: boolean;
  navLabels: Record<string, string>;
  footerText: string;
  /** Editorial content for the About page (JSON-configurable). */
  intro: string;
  bio: string[];
  capabilities: Capability[];
  process: ProcessStep[];
  clients: string[];
}

export interface AdminUser {
  id: number;
  email: string;
  passwordHash: string;
  createdAt: string;
}
