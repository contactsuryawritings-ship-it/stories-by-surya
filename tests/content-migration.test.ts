import assert from "node:assert/strict";
import test from "node:test";
import { parseContent } from "../src/lib/content/schema.ts";

const base = { brand: {}, hero: {}, homepage: {}, about: {}, contact: {}, seo: {}, footer: {} };
const photo = { id: "one", src: "/one.webp", order: 7 };
const gallery = { id: "gallery", title: "Gallery", slug: "gallery", images: [photo] };

test("legacy content gains the four sections exactly once and keeps visibility", () => {
  const content = parseContent({
    ...base,
    homepage: { sections: [{ id: "depth", visible: false, order: 1 }] },
  });
  assert.equal(content.homepage.sections.length, 4);
  assert.equal(content.homepage.sections.find((section) => section.id === "depth")?.visible, false);
  assert.deepEqual(parseContent(content), content);
});

test("an empty or hidden photo library cannot resurrect old gallery photos", () => {
  for (const photos of [[], [{ ...photo, visible: false }]]) {
    const content = parseContent({ ...base, photos, galleries: [gallery] });
    assert.equal(content.photos.length, photos.length);
    assert.ok(content.photos.every((image) => !image.visible));
  }
});

test("legacy migration imports published galleries and retains photo ordering", () => {
  const content = parseContent({
    ...base,
    galleries: [
      gallery,
      {
        ...gallery,
        id: "draft",
        slug: "draft",
        published: false,
        images: [{ ...photo, id: "hidden" }],
      },
    ],
  });
  assert.deepEqual(
    content.photos.map((image) => image.id),
    ["one"],
  );
  assert.equal(content.photos[0]?.order, 7);
});
