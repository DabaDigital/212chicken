import { expect, test, type Page } from "@playwright/test";

test.use({ reducedMotion: "no-preference" });

const layerState = (page: Page) =>
  page.evaluate(() => ({
    layers: document.querySelector("[data-hero-art]")?.getAttribute("data-layers") ?? null,
    bun: getComputedStyle(document.querySelector('[data-hero-layer="bun"]')!).transform,
  }));

test.describe("Hero motion", () => {
  test("desktop: layers load on demand, open with scroll and survive a route round-trip", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop-only enhancement");
    await page.goto("/");
    await expect(page.locator("[data-hero-art]")).toHaveAttribute("data-layers", "ready");

    await page.mouse.wheel(0, 450);
    await expect.poll(async () => (await layerState(page)).bun).not.toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);

    // Client navigation away and back must re-initialise exactly one motion controller.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole("banner").getByRole("link", { name: "La carte", exact: true }).click();
    await expect(page).toHaveURL(/\/carte$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("[data-hero]")).toHaveCount(1);
    await expect(page.locator("[data-hero-art]")).toHaveAttribute("data-layers", "ready");
    await page.mouse.wheel(0, 450);
    await expect.poll(async () => (await layerState(page)).bun).not.toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
  });

  test("phones keep the single intact image and never request the layers", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Phone behaviour");
    const layerRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("hero%2Flayers")) layerRequests.push(request.url());
    });
    await page.goto("/");
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(600);
    expect(layerRequests).toEqual([]);
    await expect(page.locator("[data-hero-photo]")).toBeVisible();
    expect((await layerState(page)).layers).toBeNull();
  });
});

test.describe("Hero motion, reduced", () => {
  test.use({ reducedMotion: "reduce" });

  test("reduced motion shows the final static composition", async ({ page }) => {
    await page.goto("/");
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(600);
    expect(await layerState(page)).toEqual({ layers: null, bun: "none" });
    await expect(page.locator("[data-hero-photo]")).toBeVisible();
  });
});
