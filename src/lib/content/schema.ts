import { z } from "zod";

/**
 * Runtime schema for /content/data.json — the single source of truth for all
 * editable website content.
 */

export const imageSchema = z.object({
  id: z.string().min(1),
  src: z.string().min(1),
  path: z.string().default(""),
  alt: z.string().default(""),
  width: z.number().int().positive().default(2400),
  height: z.number().int().positive().default(1600),
  orientation: z.enum(["landscape", "portrait", "square"]).default("landscape"),
  visible: z.boolean().default(true),
});

export const sectionTypeSchema = z.enum([
  "hero",
  "full",
  "pair",
  "portrait-pair",
  "asymmetric",
  "image-text",
  "whitespace",
]);

export const gallerySectionSchema = z.object({
  id: z.string().min(1),
  type: sectionTypeSchema,
  images: z.array(z.string()).default([]),
  text: z.string().default(""),
});

export const gallerySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  categoryId: z.string().default(""),
  location: z.string().default(""),
  date: z.string().default(""),
  description: z.string().default(""),
  coverImageId: z.string().default(""),
  published: z.boolean().default(false),
  order: z.number().default(0),
  images: z.array(imageSchema).default([]),
  sections: z.array(gallerySectionSchema).default([]),
  seo: z
    .object({
      title: z.string().default(""),
      description: z.string().default(""),
      image: z.string().default(""),
    })
    .default({ title: "", description: "", image: "" }),
});

export const categorySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  order: z.number().default(0),
  visible: z.boolean().default(true),
});

export const filmSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  platform: z.enum(["instagram", "youtube"]).default("youtube"),
  url: z.string().default(""),
  description: z.string().default(""),
  cover: imageSchema.nullable().default(null),
  published: z.boolean().default(false),
  order: z.number().default(0),
});

export const navItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  href: z.string().min(1),
  visible: z.boolean().default(true),
  order: z.number().default(0),
});

export const homepageSectionSchema = z.object({
  id: z.enum(["featured", "categories", "films", "about", "contact"]),
  label: z.string().default(""),
  eyebrow: z.string().default(""),
  heading: z.string().default(""),
  visible: z.boolean().default(true),
  order: z.number().default(0),
});

export const socialSchema = z.object({
  id: z.string().min(1),
  platform: z.string().min(1),
  label: z.string().default(""),
  url: z.string().default(""),
  visible: z.boolean().default(true),
});

export const formFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "email", "tel", "date", "textarea", "select"]).default("text"),
  required: z.boolean().default(false),
  options: z.array(z.string()).default([]),
  visible: z.boolean().default(true),
  order: z.number().default(0),
});

export const contentSchema = z.object({
  version: z.number().default(1),
  updatedAt: z.string().default(""),
  brand: z.object({
    name: z.string().default("Stories by Surya"),
    wordmark: z.string().default("Stories by Surya"),
    tagline: z.string().default(""),
  }),
  nav: z.array(navItemSchema).default([]),
  hero: z.object({
    eyebrow: z.string().default(""),
    title: z.string().default(""),
    subtitle: z.string().default(""),
    scrollLabel: z.string().default(""),
    ctaLabel: z.string().default(""),
    ctaHref: z.string().default(""),
    fallbackImage: imageSchema.nullable().default(null),
    driftWall: z
      .object({
        speed: z.number().default(26),
        tilt: z.number().default(12),
        turn: z.number().default(-10),
        dim: z.number().min(0).max(1).default(0.45),
        grayscale: z.boolean().default(false),
      })
      .default({ speed: 26, tilt: 12, turn: -10, dim: 0.45, grayscale: false }),
  }),
  homepage: z.object({
    sections: z.array(homepageSectionSchema).default([]),
    featuredGalleryIds: z.array(z.string()).default([]),
    aboutPreview: z.string().default(""),
    contactHeading: z.string().default(""),
    contactBody: z.string().default(""),
  }),
  categories: z.array(categorySchema).default([]),
  galleries: z.array(gallerySchema).default([]),
  films: z.array(filmSchema).default([]),
  about: z.object({
    eyebrow: z.string().default(""),
    heading: z.string().default(""),
    bio: z.string().default(""),
    secondary: z.string().default(""),
    portrait: imageSchema.nullable().default(null),
    stats: z
      .array(z.object({ id: z.string(), label: z.string(), value: z.string() }))
      .default([]),
  }),
  contact: z.object({
    eyebrow: z.string().default(""),
    heading: z.string().default(""),
    intro: z.string().default(""),
    email: z.string().default(""),
    phone: z.string().default(""),
    location: z.string().default(""),
    successMessage: z.string().default(""),
    fields: z.array(formFieldSchema).default([]),
  }),
  socials: z.array(socialSchema).default([]),
  seo: z.object({
    title: z.string().default("Stories by Surya"),
    titleTemplate: z.string().default("%s — Stories by Surya"),
    description: z.string().default(""),
    keywords: z.array(z.string()).default([]),
    ogImage: z.string().default(""),
  }),
  footer: z.object({
    copyright: z.string().default(""),
    showNav: z.boolean().default(true),
    showSocials: z.boolean().default(true),
    showContact: z.boolean().default(true),
    note: z.string().default(""),
  }),
});

export type SiteContent = z.infer<typeof contentSchema>;
export type ContentImage = z.infer<typeof imageSchema>;
export type Gallery = z.infer<typeof gallerySchema>;
export type GallerySection = z.infer<typeof gallerySectionSchema>;
export type GallerySectionType = z.infer<typeof sectionTypeSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Film = z.infer<typeof filmSchema>;
export type NavItem = z.infer<typeof navItemSchema>;
export type HomepageSection = z.infer<typeof homepageSectionSchema>;
export type Social = z.infer<typeof socialSchema>;
export type FormField = z.infer<typeof formFieldSchema>;

export const enquirySchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  values: z.record(z.string(), z.string()),
});
export type Enquiry = z.infer<typeof enquirySchema>;

export function parseContent(input: unknown): SiteContent {
  return contentSchema.parse(input);
}

export function safeParseContent(input: unknown) {
  return contentSchema.safeParse(input);
}
