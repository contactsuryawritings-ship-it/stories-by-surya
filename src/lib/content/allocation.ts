import type { ContentImage } from "./schema";

export type HomepageAllocation = {
  topPicks: ContentImage[];
  depthCarousel: ContentImage[];
  morphSlider: ContentImage[];
  circularGallery: ContentImage[];
};

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function seededShuffle(images: ContentImage[]): ContentImage[] {
  return [...images].sort((a, b) => hash(a.id) - hash(b.id) || a.id.localeCompare(b.id));
}

export function allocateHomepagePhotos({
  publishedPhotos,
  topPickImageIds,
}: {
  publishedPhotos: ContentImage[];
  topPickImageIds: string[];
}): HomepageAllocation {
  const seen = new Set<string>();
  const published = publishedPhotos
    .filter((image) => {
      if (!image.visible || seen.has(image.id)) return false;
      seen.add(image.id);
      return true;
    })
    .sort((a, b) => a.order - b.order);
  const byId = new Map(published.map((image) => [image.id, image]));
  const curated = [...new Set(topPickImageIds)]
    .map((id) => byId.get(id))
    .filter((image): image is ContentImage => Boolean(image));

  // Reserve a photograph for each section before honoring additional pins.
  // Saved pins are retained in the CMS and become eligible as the library grows.
  const pinLimit = published.length ? Math.min(10, Math.max(1, published.length - 3)) : 0;
  const topPicks = curated.slice(0, pinLimit);
  const counts = [topPicks.length, 0, 0, 0];
  const caps = [10, 20, 20, 15];

  // Fill the smallest section first, respecting the original 10/20/20/15 limits.
  // With four photos this gives one to every section, even if all four are pinned.
  for (let allocated = topPicks.length; allocated < Math.min(published.length, 65); allocated++) {
    let next = -1;
    for (let index = 0; index < counts.length; index++) {
      if (counts[index]! < caps[index]! && (next < 0 || counts[index]! < counts[next]!))
        next = index;
    }
    counts[next]! += 1;
  }
  const overflow = Math.max(0, published.length - 65);
  counts[1]! += Math.ceil(overflow / 2);
  counts[2]! += Math.floor(overflow / 2);

  const picked = new Set(topPicks.map((image) => image.id));
  for (const image of published) {
    if (topPicks.length === counts[0]) break;
    if (!picked.has(image.id)) {
      topPicks.push(image);
      picked.add(image.id);
    }
  }

  const remaining = seededShuffle(published.filter((image) => !picked.has(image.id)));
  const depthEnd = counts[1]!;
  const morphEnd = depthEnd + counts[2]!;
  return {
    topPicks,
    depthCarousel: remaining.slice(0, depthEnd),
    morphSlider: remaining.slice(depthEnd, morphEnd),
    circularGallery: remaining.slice(morphEnd),
  };
}
