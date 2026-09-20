import { expect, test } from "@playwright/test";

test("the form saves post/reel type and aspect ratio and renders matching cards", async ({
  page,
}) => {
  await page.route("https://www.instagram.com/**/embed", (route) =>
    route.fulfill({ contentType: "text/html", body: "<p>Embedded media</p>" }),
  );
  await page.route("http://127.0.0.1:8080/__films-test", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head></head><body><div id="root"></div><script type="module">
    import RefreshRuntime from '/@react-refresh';
    RefreshRuntime.injectIntoGlobalHook(window);
    window.$RefreshReg$ = () => {}; window.$RefreshSig$ = () => type => type;
    window.__vite_plugin_react_preamble_installed__ = true;
    await import('/tests/fixtures/films.tsx');
  </script></body></html>`,
    }),
  );
  await page.goto("/__films-test");
  await page.getByRole("button", { name: "Create film" }).click();
  await page.getByLabel("Title", { exact: true }).fill("Portrait post");
  await page.getByLabel("Source URL").fill("https://www.instagram.com/p/newpost/");
  await expect(page.getByRole("combobox", { name: "Reel or Post" })).toHaveValue("post");
  await page.getByRole("combobox", { name: "Aspect ratio" }).selectOption("4:5");
  await page.getByLabel("Published", { exact: true }).check();
  await page.getByRole("button", { name: "Save film", exact: true }).click();
  const library = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Film library" }) });
  const row = library.locator("div.border").filter({ hasText: "Portrait post" });
  await expect(row).toContainText("Instagram Post · 4:5");
  await row.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Reel or Post" })).toHaveValue("post");
  await expect(page.getByRole("combobox", { name: "Aspect ratio" })).toHaveValue("4:5");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  const preview = page.getByLabel("Public preview");
  const post = preview.getByTitle("Portrait post");
  await expect(post).toHaveAttribute("src", "https://www.instagram.com/p/newpost/embed");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [title, ratio] of [
      ["Portrait post", 4 / 5],
      ["Existing post", 1],
      ["Existing reel", 9 / 16],
    ] as const) {
      const frame = await preview.getByTitle(title).boundingBox();
      expect(frame!.width / frame!.height).toBeCloseTo(ratio, 2);
    }
  }
  await expect(preview.getByText("Instagram Post", { exact: true })).toHaveCount(2);
  await expect(preview.getByText("Instagram Reel", { exact: true })).toHaveCount(1);
});
