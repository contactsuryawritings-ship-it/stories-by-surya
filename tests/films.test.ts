import assert from "node:assert/strict";
import test from "node:test";
import { filmSchema, FILM_ASPECT_RATIOS, parseContent } from "../src/lib/content/schema.ts";
import { filmAspectRatio, filmLabel, getFilmSource } from "../src/lib/content/film.ts";

const film = {
  id: "film",
  title: "A moment",
  platform: "instagram",
  url: "https://www.instagram.com/p/AbC_123/?img_index=1",
};

test("Instagram posts retain their post embed URL and label", () => {
  const parsed = filmSchema.parse(film);
  assert.equal(parsed.contentType, "post");
  assert.equal(parsed.aspectRatio, "1:1");
  assert.equal(filmLabel(parsed), "Instagram Post");
  assert.equal(getFilmSource(parsed.url)?.embedUrl, "https://www.instagram.com/p/AbC_123/embed");
});

test("legacy reels, posts, YouTube videos and Shorts get suitable defaults", () => {
  for (const [url, type, ratio] of [
    [film.url, "post", "1:1"],
    ["https://instagram.com/reel/AbC_123/", "reel", "9:16"],
    ["https://youtube.com/watch?v=AbC_123", "reel", "16:9"],
    ["https://youtube.com/shorts/AbC_123", "reel", "9:16"],
  ]) {
    const parsed = filmSchema.parse({ ...film, url });
    assert.equal(parsed.contentType, type);
    assert.equal(parsed.aspectRatio, ratio);
  }
});

test("saved types and every selected ratio survive content validation and reload", () => {
  for (const aspectRatio of FILM_ASPECT_RATIOS) {
    const input = { ...film, contentType: "post", aspectRatio };
    const content = parseContent({
      brand: {},
      hero: {},
      homepage: {},
      about: {},
      contact: {},
      seo: {},
      footer: {},
      films: [input],
    });
    assert.equal(content.films[0]?.aspectRatio, aspectRatio);
    assert.equal(content.films[0]?.contentType, "post");
    assert.deepEqual(parseContent(JSON.parse(JSON.stringify(content))), content);
    assert.equal(filmAspectRatio(aspectRatio), aspectRatio.replace(":", " / "));
  }
  assert.equal(filmSchema.safeParse({ ...film, aspectRatio: "0:0" }).success, false);
});

test("only supported source hosts and media paths can become embeds", () => {
  for (const url of [
    "https://example.com/instagram.com/p/fake",
    "https://instagram.com.example.com/p/fake",
    "javascript:alert(1)",
    "https://instagram.com/some-profile",
    "not a url",
  ]) {
    assert.equal(getFilmSource(url), null);
  }
  assert.equal(
    getFilmSource("https://youtu.be/AbC_123?t=30")?.embedUrl,
    "https://www.youtube.com/embed/AbC_123",
  );
});
