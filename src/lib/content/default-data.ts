import { parseContent, type SiteContent } from "./schema";

/**
 * Starter content. Structure only — no invented biography, testimonials,
 * awards, contact details or social accounts. Everything here is editable
 * from the dashboard.
 */
const raw = {
  version: 1,
  updatedAt: "",
  brand: {
    name: "Stories by Surya",
    wordmark: "Stories by Surya",
    tagline: "",
  },
  nav: [
    { id: "nav_work", label: "Work", href: "/work", visible: true, order: 0 },
    { id: "nav_films", label: "Films", href: "/films", visible: true, order: 1 },
    { id: "nav_about", label: "About", href: "/about", visible: true, order: 2 },
    { id: "nav_contact", label: "Contact", href: "/contact", visible: true, order: 3 },
  ],
  hero: {
    eyebrow: "",
    title: "Stories by Surya",
    subtitle: "",
    scrollLabel: "Explore",
    ctaLabel: "",
    ctaHref: "",
    fallbackImage: null,
    driftWall: { speed: 26, tilt: 12, turn: -10, dim: 0.45, grayscale: false },
  },
  homepage: {
    sections: [
      { id: "featured", label: "Featured Stories", eyebrow: "Selected", heading: "", visible: true, order: 0 },
      { id: "categories", label: "Collections", eyebrow: "Collections", heading: "", visible: true, order: 1 },
      { id: "films", label: "Films", eyebrow: "Films", heading: "", visible: true, order: 2 },
      { id: "about", label: "About", eyebrow: "About", heading: "", visible: true, order: 3 },
      { id: "contact", label: "Enquire", eyebrow: "Enquire", heading: "", visible: true, order: 4 },
    ],
    featuredGalleryIds: [],
    aboutPreview: "",
    contactHeading: "",
    contactBody: "",
  },
  categories: [
    { id: "cat_weddings", slug: "weddings", title: "Weddings", description: "", order: 0, visible: true },
    { id: "cat_pre_weddings", slug: "pre-weddings", title: "Pre-Weddings", description: "", order: 1, visible: true },
    { id: "cat_portraits", slug: "portraits", title: "Portraits", description: "", order: 2, visible: true },
  ],
  galleries: [],
  films: [],
  about: {
    eyebrow: "",
    heading: "",
    bio: "",
    secondary: "",
    portrait: null,
    stats: [],
  },
  contact: {
    eyebrow: "",
    heading: "",
    intro: "",
    email: "",
    phone: "",
    location: "",
    successMessage: "Thank you — your enquiry has been received.",
    fields: [
      { id: "name", label: "Name", type: "text", required: true, options: [], visible: true, order: 0 },
      { id: "email", label: "Email", type: "email", required: true, options: [], visible: true, order: 1 },
      { id: "phone", label: "Phone", type: "tel", required: false, options: [], visible: true, order: 2 },
      { id: "occasion", label: "Occasion", type: "text", required: false, options: [], visible: true, order: 3 },
      { id: "date", label: "Event date", type: "date", required: false, options: [], visible: true, order: 4 },
      { id: "location", label: "Location", type: "text", required: false, options: [], visible: true, order: 5 },
      { id: "message", label: "Message", type: "textarea", required: false, options: [], visible: true, order: 6 },
    ],
  },
  socials: [
    { id: "soc_instagram", platform: "instagram", label: "Instagram", url: "", visible: true },
    { id: "soc_youtube", platform: "youtube", label: "YouTube", url: "", visible: true },
  ],
  seo: {
    title: "Stories by Surya",
    titleTemplate: "%s — Stories by Surya",
    description: "",
    keywords: [],
    ogImage: "",
  },
  footer: {
    copyright: "Stories by Surya",
    showNav: true,
    showSocials: true,
    showContact: true,
    note: "",
  },
};

export const defaultContent: SiteContent = parseContent(raw);

export function cloneDefaultContent(): SiteContent {
  return parseContent(JSON.parse(JSON.stringify(raw)));
}
