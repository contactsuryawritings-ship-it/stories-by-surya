import { z } from "zod";
import { getFilmSource } from "./film.ts";

/**
 * Runtime schema for /content/data.json — the single source of truth for all
 * editable website content.
 */

export const imageSchema = z.object({
  id: z.string().min(1),
  src: z.string().min(1),
  path: z.string().default(""),
  alt: z.string().default(""),
  width: z.number().int().positive().nullable().default(null),
  height: z.number().int().positive().nullable().default(null),
  orientation: z.enum(["landscape", "portrait", "square"]).default("landscape"),
  visible: z.boolean().default(true),
  order: z.number().default(0),
});

export const sectionTypeSchema = z.enum([
  "hero",
  "full",
  "pair",
  "portrait-pair",
  "landscape-pair",
  "asymmetric",
  "image-text",
  "whitespace",
]);

/** Curated editorial layouts, with how many photographs each one holds. */
export const SECTION_LAYOUTS: {
  type: z.infer<typeof sectionTypeSchema>;
  label: string;
  capacity: number;
  usesText: boolean;
}[] = [
  { type: "hero", label: "Hero", capacity: 1, usesText: false },
  { type: "full", label: "Full width", capacity: 1, usesText: false },
  { type: "pair", label: "Pair", capacity: 2, usesText: false },
  { type: "portrait-pair", label: "Portrait pair", capacity: 2, usesText: false },
  { type: "landscape-pair", label: "Landscape pair", capacity: 2, usesText: false },
  { type: "asymmetric", label: "Editorial / asymmetric", capacity: 3, usesText: false },
  { type: "image-text", label: "Image + text", capacity: 1, usesText: true },
  { type: "whitespace", label: "Quiet space / words", capacity: 0, usesText: true },
];

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

export const FILM_ASPECT_RATIOS = [
  "9:16",
  "4:5",
  "3:4",
  "1:1",
  "4:3",
  "3:2",
  "16:9",
  "1.91:1",
] as const;

export const filmSchema = z.preprocess(
  (input) => {
    if (!input || typeof input !== "object") return input;
    const value = input as Record<string, unknown>;
    const source = typeof value["url"] === "string" ? getFilmSource(value["url"]) : null;
    const contentType = value["contentType"] ?? source?.contentType ?? "reel";
    return {
      ...value,
      contentType,
      aspectRatio:
        value["aspectRatio"] ?? (contentType === "post" ? "1:1" : (source?.aspectRatio ?? "16:9")),
    };
  },
  z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    platform: z.enum(["instagram", "youtube"]).default("youtube"),
    contentType: z.enum(["reel", "post"]),
    aspectRatio: z.enum(FILM_ASPECT_RATIOS),
    url: z.string().default(""),
    description: z.string().default(""),
    cover: imageSchema.nullable().default(null),
    published: z.boolean().default(false),
    order: z.number().default(0),
  }),
);

export const navItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  href: z.string().min(1),
  visible: z.boolean().default(true),
  order: z.number().default(0),
});

export const homepageSectionSchema = z.object({
  id: z.enum([
    "ripple",
    "depth",
    "morph",
    "circular",
    "featured",
    "categories",
    "films",
    "about",
    "contact",
  ]),
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

export const SOCIAL_PLATFORMS = ["instagram", "youtube", "facebook", "whatsapp"] as const;

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
  photos: z.array(imageSchema).default([]),
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
    topPickImageIds: z.array(z.string()).max(10).default([]),
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
    stats: z.array(z.object({ id: z.string(), label: z.string(), value: z.string() })).default([]),
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
  return contentSchema.parse(migrateContent(input));
}

export function safeParseContent(input: unknown) {
  return contentSchema.safeParse(migrateContent(input));
}

/** Keep existing gallery-backed content readable while photos become the V1 source. */
function migrateContent(input: unknown): unknown {
  if (!input || typeof input !== "object") return input;
  const value = input as { photos?: unknown; galleries?: unknown; homepage?: unknown };
  const galleries = Array.isArray(value.galleries) ? value.galleries : [];
  const legacyPhotos = galleries.flatMap((gallery) => {
    if (!gallery || typeof gallery !== "object") return [];
    const item = gallery as { images?: unknown; published?: unknown };
    return item.published !== false && Array.isArray(item.images) ? item.images : [];
  });
  const photos = Array.isArray(value.photos) ? value.photos : legacyPhotos;
  const seen = new Set<string>();
  const uniquePhotos = photos.filter((photo) => {
    if (!photo || typeof photo !== "object") return false;
    const image = photo as { id?: unknown; path?: unknown; src?: unknown };
    const key = String(image.id || image.path || image.src || "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const homepage = value.homepage && typeof value.homepage === "object" ? value.homepage : {};
  const homepageValue = homepage as { sections?: unknown; topPickImageIds?: unknown };
  const existingSections = Array.isArray(homepageValue.sections) ? homepageValue.sections : [];
  const existingIds = new Set(
    existingSections.flatMap((section) =>
      section && typeof section === "object" && "id" in section ? [String(section.id)] : [],
    ),
  );
  const sectionSeeds: [string, string, string, string][] = [
    ["ripple", "Top Picks", "Top Picks", "A closer look."],
    ["depth", "Selected Work", "Selected Work", "Images in sequence."],
    ["morph", "Stories", "Stories", "One frame becoming another."],
    ["circular", "Archive", "Archive", "Keep looking."],
  ];
  const newSections = sectionSeeds
    .map(([id, label, eyebrow, heading], order) => ({
      id,
      label,
      eyebrow,
      heading,
      visible: true,
      order,
    }))
    .filter((section) => !existingIds.has(section.id));

  return {
    ...value,
    photos: uniquePhotos.map((photo, index) => ({ order: index, ...(photo as object) })),
    homepage: {
      ...homepage,
      sections: [...existingSections, ...newSections],
      topPickImageIds: Array.isArray(homepageValue.topPickImageIds)
        ? [...new Set(homepageValue.topPickImageIds)].slice(0, 10)
        : [],
    },
  };
}
