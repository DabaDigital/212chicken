import { expect, test, type Page } from "@playwright/test";

test.use({ reducedMotion: "no-preference" });

const layerState = (page: Page) =>
  page.evaluate(() => ({
    layers: document.querySelector("[data-hero-art]")?.getAttribute("data-layers") ?? null,
    bun: getComputedStyle(document.querySelector('[data-hero-layer="bun"]')!).transform,
  }));

test.describe("Hero motion", () => {
  test("desktop: animation survives a route round-trip", async ({ page, isMobile }) => {
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

  test("the burger assembles, explodes and can be paused on either device", async ({ page }) => {
    await page.goto("/");
    await page.locator("[data-hero-art]").scrollIntoViewIfNeeded();
    await expect(page.getByRole("button", { name: "Assembler le burger", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Assembler le burger", exact: true }).click();
    await expect(page.locator("[data-burger-assembled]")).toHaveCSS("opacity", "1");
    await expect(page.locator("[data-burger-exploded]")).toHaveCSS("opacity", "0");
    await page.getByRole("button", { name: "Faire exploser le burger", exact: true }).click();
    await expect(page.locator("[data-burger-exploded]")).toHaveCSS("opacity", "1");
    await expect(page.locator("[data-burger-assembled]")).toHaveCSS("opacity", "0");
    await page.getByRole("button", { name: "Mettre l’animation en pause", exact: true }).click();
    const floating = page.locator("[data-burger-float]");
    const before = await floating.evaluate((el) => getComputedStyle(el).transform);
    await page.waitForTimeout(350);
    expect(await floating.evaluate((el) => getComputedStyle(el).transform)).toBe(before);
    await expect(page.getByRole("button", { name: "Reprendre l’animation", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  test("failed secondary artwork preserves the original burger and hides unavailable controls", async ({ page }) => {
    await page.route(/burger-assembled/, (route) => route.abort());
    await page.goto("/");
    await page.locator("[data-hero-art]").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-hero-photo]")).toHaveCSS("opacity", "1");
    await expect(page.locator("[data-burger-toggle]")).toBeHidden();
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
    await expect(page.locator("[data-burger-controls]")).toBeHidden();
  });
});
