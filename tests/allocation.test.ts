import assert from "node:assert/strict";
import test from "node:test";

import { allocateHomepagePhotos } from "../src/lib/content/allocation.ts";
import type { ContentImage } from "../src/lib/content/schema.ts";

function photos(count: number, unpublished = new Set<number>()): ContentImage[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `img_${index}`,
    src: `/images/${index}.webp`,
    path: "",
    alt: "",
    width: 1200,
    height: 800,
    orientation: "landscape",
    visible: !unpublished.has(index),
    order: index,
  }));
}

function flatten(result: ReturnType<typeof allocateHomepagePhotos>) {
  return Object.values(result).flat();
}

test("shares small libraries across every section before filling section limits", () => {
  const examples = [
    [0, [0, 0, 0, 0]],
    [1, [1, 0, 0, 0]],
    [2, [1, 1, 0, 0]],
    [3, [1, 1, 1, 0]],
    [4, [1, 1, 1, 1]],
    [5, [2, 1, 1, 1]],
    [10, [3, 3, 2, 2]],
    [30, [8, 8, 7, 7]],
    [40, [10, 10, 10, 10]],
    [65, [10, 20, 20, 15]],
  ] as const;
  for (const [count, sizes] of examples) {
    const result = allocateHomepagePhotos({ publishedPhotos: photos(count), topPickImageIds: [] });
    assert.deepEqual(
      Object.values(result).map((section) => section.length),
      sizes,
    );
    assert.equal(flatten(result).length, count);
    assert.equal(new Set(flatten(result).map((image) => image.id)).size, count);
  }
});

test("even fully pinned libraries leave one unique photo for every section", () => {
  for (let count = 4; count <= 100; count++) {
    const input = photos(count);
    const pins = input
      .slice(0, 10)
      .map((image) => image.id)
      .reverse();
    const result = allocateHomepagePhotos({ publishedPhotos: input, topPickImageIds: pins });
    assert.ok(Object.values(result).every((section) => section.length > 0));
    assert.equal(flatten(result).length, count);
    assert.equal(new Set(flatten(result).map((image) => image.id)).size, count);
    assert.deepEqual(
      result.topPicks.map((image) => image.id),
      pins.slice(0, Math.min(10, Math.max(1, count - 3))),
    );
  }
});

test("small-library allocation uses only distinct visible photographs", () => {
  const input = photos(7, new Set([0, 1, 2]));
  const result = allocateHomepagePhotos({
    publishedPhotos: [...input, ...input],
    topPickImageIds: ["img_0", "deleted", "img_6", "img_5"],
  });
  assert.deepEqual(
    Object.values(result).map((section) => section.length),
    [1, 1, 1, 1],
  );
  assert.equal(result.topPicks[0]?.id, "img_6");
  assert.equal(new Set(flatten(result).map((image) => image.id)).size, 4);
});

test("curated picks lead in their chosen order and empty slots are filled", () => {
  const result = allocateHomepagePhotos({
    publishedPhotos: photos(65),
    topPickImageIds: ["img_7", "img_2", "img_7", "deleted", "img_4"],
  });
  assert.deepEqual(
    result.topPicks.slice(0, 3).map((image) => image.id),
    ["img_7", "img_2", "img_4"],
  );
  assert.equal(result.topPicks.length, 10);
  assert.equal(new Set(flatten(result).map((image) => image.id)).size, 65);
  assert.ok(result.topPicks.every((image) => !result.depthCarousel.includes(image)));
});

test("ten curated picks stay fixed while overflow splits across sections two and three", () => {
  for (const count of [65, 66, 85, 101]) {
    const picks = photos(10)
      .map((image) => image.id)
      .reverse();
    const result = allocateHomepagePhotos({
      publishedPhotos: photos(count),
      topPickImageIds: picks,
    });
    assert.deepEqual(
      result.topPicks.map((image) => image.id),
      picks,
    );
    assert.equal(result.circularGallery.length, 15);
    assert.equal(result.depthCarousel.length, Math.ceil((count - 25) / 2));
    assert.equal(result.morphSlider.length, Math.floor((count - 25) / 2));
    assert.equal(new Set(flatten(result).map((image) => image.id)).size, count);
  }
});

test("hidden, missing, and duplicate photographs never occupy a slot", () => {
  const input = photos(70, new Set([1, 3, 5]));
  const result = allocateHomepagePhotos({
    publishedPhotos: [...input, ...input],
    topPickImageIds: ["deleted", "img_1", "img_2"],
  });
  const all = flatten(result);
  assert.equal(all.length, 67);
  assert.equal(new Set(all.map((image) => image.id)).size, 67);
  assert.ok(all.every((image) => image.visible));
  assert.equal(result.topPicks[0]?.id, "img_2");
});

test("allocation is stable across re-renders and reordered input with explicit library order", () => {
  const input = photos(85);
  const first = allocateHomepagePhotos({ publishedPhotos: input, topPickImageIds: ["img_2"] });
  const second = allocateHomepagePhotos({
    publishedPhotos: input.reverse(),
    topPickImageIds: ["img_2"],
  });
  assert.deepEqual(first, second);
});
