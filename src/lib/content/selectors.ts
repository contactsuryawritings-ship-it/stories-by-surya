import type {
  Category,
  ContentImage,
  Film,
  Gallery,
  SiteContent,
} from "./schema";

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export function publishedGalleries(content: SiteContent): Gallery[] {
  return content.galleries.filter((g) => g.published).sort(byOrder);
}

export function visibleImages(gallery: Gallery): ContentImage[] {
  return gallery.images.filter((i) => i.visible);
}

export function visibleCategories(content: SiteContent): Category[] {
  return content.categories.filter((c) => c.visible).sort(byOrder);
}

export function categoriesWithWork(content: SiteContent): Category[] {
  const published = publishedGalleries(content);
  return visibleCategories(content).filter((c) =>
    published.some((g) => g.categoryId === c.id),
  );
}

export function galleriesInCategory(content: SiteContent, categoryId: string): Gallery[] {
  return publishedGalleries(content).filter((g) => g.categoryId === categoryId);
}

export function findCategoryBySlug(content: SiteContent, slug: string): Category | undefined {
  return content.categories.find((c) => c.slug === slug && c.visible);
}

export function findGalleryBySlug(content: SiteContent, slug: string): Gallery | undefined {
  return content.galleries.find((g) => g.slug === slug);
}

export function coverImage(gallery: Gallery): ContentImage | undefined {
  const images = visibleImages(gallery);
  return images.find((i) => i.id === gallery.coverImageId) ?? images[0];
}

export function publishedFilms(content: SiteContent): Film[] {
  return content.films.filter((f) => f.published).sort(byOrder);
}

export function featuredGalleries(content: SiteContent): Gallery[] {
  const published = publishedGalleries(content);
  const ids = content.homepage.featuredGalleryIds;
  const picked = ids
    .map((id) => published.find((g) => g.id === id))
    .filter((g): g is Gallery => Boolean(g));
  return picked.length ? picked : published.slice(0, 4);
}

export function visibleNav(content: SiteContent) {
  return content.nav.filter((n) => n.visible).sort(byOrder);
}

export function visibleSocials(content: SiteContent) {
  return content.socials.filter((s) => s.visible && s.url.trim().length > 0);
}

export function visibleFormFields(content: SiteContent) {
  return content.contact.fields.filter((f) => f.visible).sort(byOrder);
}

export function homepageSections(content: SiteContent) {
  return content.homepage.sections.filter((s) => s.visible).sort(byOrder);
}

/** Every published photograph — the Drift Wall image pool. */
export function driftWallPool(content: SiteContent): ContentImage[] {
  return publishedGalleries(content).flatMap(visibleImages);
}

export function galleryImageMap(gallery: Gallery): Map<string, ContentImage> {
  return new Map(gallery.images.map((i) => [i.id, i]));
}

/** Sections to render for a gallery — falls back to a sensible rhythm. */
export function gallerySections(gallery: Gallery) {
  if (gallery.sections.length) {
    return gallery.sections.filter((s) =>
      s.type === "whitespace" || s.type === "image-text"
        ? true
        : s.images.some((id) => visibleImages(gallery).some((i) => i.id === id)),
    );
  }
  const images = visibleImages(gallery);
  const generated: { id: string; type: string; images: string[]; text: string }[] = [];
  let index = 0;
  let step = 0;
  while (index < images.length) {
    const pattern = step === 0 ? "hero" : step % 3 === 1 ? "pair" : step % 3 === 2 ? "full" : "asymmetric";
    const take = pattern === "pair" ? 2 : pattern === "asymmetric" ? 3 : 1;
    const slice = images.slice(index, index + take).map((i) => i.id);
    if (!slice.length) break;
    generated.push({ id: `auto_${step}`, type: pattern, images: slice, text: "" });
    index += slice.length;
    step += 1;
  }
  return generated as Gallery["sections"];
}
