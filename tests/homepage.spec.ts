import { expect, test, type Page } from "@playwright/test";
import { photoDimensions } from "./fixtures/photo-dimensions";

async function openFixture(page: Page, count?: number) {
  // Isolated in-memory content: these tests never read or write the live CMS.
  await page.route("**/__photos/*.svg", (route) => {
    const index = Number(
      route
        .request()
        .url()
        .match(/(\d+)\.svg/)?.[1] ?? 0,
    );
    const { width, height } = photoDimensions(index);
    return route.fulfill({
      contentType: "image/svg+xml",
      body: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="hsl(${(index * 29) % 360} 40% 45%)"/><circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.3}" fill="#eeddbb"/><rect x="8" y="8" width="${width - 16}" height="${height - 16}" fill="none" stroke="white" stroke-width="16"/><text x="${width / 2}" y="${height / 2 + 40}" text-anchor="middle" font-size="100">${index + 1}</text></svg>`,
    });
  });
  await page.route(/^http:\/\/127\.0\.0\.1:8080\/(\?.*)?$/, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head></head><body><script type="module">
    import RefreshRuntime from '/@react-refresh';
    RefreshRuntime.injectIntoGlobalHook(window);
    window.$RefreshReg$ = () => {}; window.$RefreshSig$ = () => type => type;
    window.__vite_plugin_react_preamble_installed__ = true;
    await import('/tests/fixtures/homepage.tsx');
  </script></body></html>`,
    }),
  );
  await page.goto(count ? `/?photos=${count}` : "/");
  await expect(page.locator("#ripple")).toBeVisible();
}

test("real effects render, controls navigate, and sections retain height", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openFixture(page);
  const ripple = page.locator("#ripple");
  await ripple.scrollIntoViewIfNeeded();
  await expect(ripple.locator("canvas")).toBeVisible();
  await ripple.screenshot({ path: test.info().outputPath("ripple.png") });
  await ripple.getByRole("button", { name: "Next top pick" }).click();
  await expect(
    ripple.getByRole("button", { name: "Show top pick 2", exact: true }),
  ).toHaveAttribute("aria-current", "true");

  const depth = page.locator("#depth");
  await depth.scrollIntoViewIfNeeded();
  await expect(depth.getByRole("group", { name: "Depth carousel" })).toBeVisible();
  await depth.screenshot({ path: test.info().outputPath("depth.png") });
  await depth.getByRole("button", { name: "Next slide" }).click();
  await expect(depth.locator('[aria-live="polite"]')).toContainText("2 / 30");

  const morph = page.locator("#morph");
  await morph.scrollIntoViewIfNeeded();
  await expect(morph.locator("canvas")).toBeVisible();
  await morph.screenshot({ path: test.info().outputPath("morph.png") });
  await morph.getByRole("button", { name: "Next slide" }).click();
  await expect(morph.locator('[aria-live="polite"]')).toContainText("2 / 30");

  const circular = page.locator("#circular");
  await circular.scrollIntoViewIfNeeded();
  await expect(circular.locator("canvas")).toBeVisible();
  await circular.screenshot({ path: test.info().outputPath("circular.png") });
  await circular.getByRole("button", { name: "Next photograph" }).click();
  await expect(circular.locator('[aria-live="polite"]')).toContainText("2 / 15");
  const height = await page.locator("body").evaluate((body) => body.scrollHeight);
  await ripple.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  expect(await page.locator("body").evaluate((body) => body.scrollHeight)).toBe(height);
  expect(errors).toEqual([]);
});

test("mobile galleries fit the viewport and leave vertical wheel scrolling available", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openFixture(page);
  for (const id of ["ripple", "depth", "morph", "circular"]) {
    const section = page.locator(`#${id}`);
    await section.scrollIntoViewIfNeeded();
    const button = section
      .getByRole("button", { name: /Next (top pick|slide|photograph)/ })
      .first();
    await expect(button).toBeVisible();
    await button.click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  for (const id of ["depth", "circular"]) {
    const section = page.locator(`#${id}`);
    await section.scrollIntoViewIfNeeded();
    const box = await section.boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    const before = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 200);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
  }
});

test("reduced-motion fallback preserves images and navigation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openFixture(page);
  for (const id of ["depth", "morph", "circular"]) {
    const section = page.locator(`#${id}`);
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole("group", { name: "Photographs" })).toBeVisible();
    await section.getByRole("button", { name: "Next photograph" }).click();
    await expect(section.getByRole("group").locator('[aria-live="polite"]')).toContainText("2 /");
    await expect(section.locator("canvas")).toHaveCount(0);
  }
});

test("horizontal touch gestures navigate each gallery", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await openFixture(page);
  const cdp = await context.newCDPSession(page);
  for (const id of ["ripple", "depth", "morph", "circular"]) {
    const section = page.locator(`#${id}`);
    await section.scrollIntoViewIfNeeded();
    const surface =
      id === "ripple"
        ? section.getByRole("group")
        : id === "depth"
          ? section.getByRole("group")
          : section.locator("canvas");
    await expect(surface).toBeVisible();
    const box = await surface.boundingBox();
    const x = box!.x + box!.width * 0.82;
    const y = box!.y + box!.height / 2;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (let step = 1; step <= 10; step++) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x - (box!.width * 0.68 * step) / 10, y }],
      });
      await page.waitForTimeout(30);
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    const counter = section.locator('[aria-live="polite"]').first();
    await expect(counter).not.toHaveText(/^0?1 \/ /);
  }
  await context.close();
});

test("lost WebGL contexts fall back to usable image controls", async ({ page }) => {
  await openFixture(page);
  for (const id of ["morph", "circular"]) {
    const section = page.locator(`#${id}`);
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator("canvas")).toBeVisible();
    await section.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    });
    await expect(section.getByRole("group", { name: "Photographs" })).toBeVisible();
    await section.getByRole("button", { name: "Next photograph" }).click();
    await expect(section.getByRole("group").locator('[aria-live="polite"]')).toContainText("2 /");
  }
});

for (const width of [1440, 390]) {
  test(`photos retain their natural proportions at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await openFixture(page);
    const ripple = page.locator("#ripple");
    for (let index = 0; index < 4; index++) {
      await ripple.getByRole("button", { name: `Show top pick ${index + 1}`, exact: true }).click();
      const image = ripple.getByRole("group").locator("img");
      await expect
        .poll(async () =>
          image.evaluate((node: HTMLImageElement) => {
            const frame = node.getBoundingClientRect();
            return Math.abs(frame.width / frame.height - node.naturalWidth / node.naturalHeight);
          }),
        )
        .toBeLessThan(0.01);
      await expect(ripple.locator("canvas")).toBeVisible();
      await ripple.screenshot({ path: test.info().outputPath(`ripple-${index}.png`) });
    }
    const depth = page.locator("#depth");
    await depth.scrollIntoViewIfNeeded();
    for (let index = 0; index < 4; index++) {
      const card = depth.locator('[aria-roledescription="slide"][aria-hidden="false"]');
      await expect
        .poll(async () =>
          card.evaluate((node) => {
            const image = node.querySelector("img")!;
            return Math.abs(
              (node as HTMLElement).offsetWidth / (node as HTMLElement).offsetHeight -
                image.naturalWidth / image.naturalHeight,
            );
          }),
        )
        .toBeLessThan(0.02);
      await depth.getByRole("button", { name: "Next slide" }).click();
    }
    const morph = page.locator("#morph");
    await morph.scrollIntoViewIfNeeded();
    await expect(morph.locator("canvas")).toBeVisible();
    for (let index = 0; index < 4; index++) {
      const label = (await morph.locator('[aria-live="polite"]').last().textContent())!;
      const photoIndex = Number(label.match(/Photograph (\d+)/)?.[1]) - 1;
      const size = photoDimensions(photoIndex);
      await expect
        .poll(async () =>
          morph.locator("canvas").evaluate((node) => {
            const frame = node.getBoundingClientRect();
            return frame.width / frame.height;
          }),
        )
        .toBeCloseTo(size.width / size.height, 2);
      await page.waitForTimeout(1200);
      await morph.screenshot({ path: test.info().outputPath(`morph-${index}.png`) });
      await morph.getByRole("button", { name: "Next slide" }).click();
    }
    const circular = page.locator("#circular");
    await circular.scrollIntoViewIfNeeded();
    await expect(circular.locator("canvas")).toBeVisible();
    await circular.screenshot({ path: test.info().outputPath("circular-mixed.png") });
  });
}

test("four pinned photos render all four sections", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openFixture(page, 4);
  for (const id of ["ripple", "depth", "morph", "circular"]) {
    const section = page.locator(`#${id}`);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    if (id === "depth") {
      await expect(section.locator('[aria-roledescription="slide"]')).toHaveCount(1);
    } else {
      await expect(section.locator("canvas")).toBeVisible();
    }
    await expect(section.locator('[aria-live="polite"]').first()).toContainText(/0?1 \/ 0?1/);
  }
  expect(errors).toEqual([]);
});
