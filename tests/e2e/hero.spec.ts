import { expect, test, type Locator } from "@playwright/test";

const top = async (locator: Locator) => (await locator.boundingBox())!.y;
const bottom = async (locator: Locator) => {
  const box = (await locator.boundingBox())!;
  return box.y + box.height;
};

test.describe("Hero order on phones", () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(!isMobile, "From 768px the burger sits beside the copy");
  });

  test("stacks the headline, then the burger, then the actions", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("[data-hero]");
    const lead = hero.getByText("Du poulet croustillant. Du goût. Du vrai.");
    const art = page.locator("[data-hero-art]");
    const explore = hero.getByRole("link", { name: "Explorer la carte" });

    expect(await bottom(lead)).toBeLessThanOrEqual(await top(art));
    expect(await bottom(art)).toBeLessThanOrEqual(await top(explore));
  });

  test.describe("with motion", () => {
    test.use({ reducedMotion: "no-preference" });

    test("places the burger controls between the burger and the actions", async ({ page }) => {
      await page.goto("/");
      const hero = page.locator("[data-hero]");
      await expect(hero.getByRole("button", { name: "Assembler le burger", exact: true })).toBeVisible();
      const controls = page.locator("[data-burger-controls]");

      expect(await bottom(page.locator("[data-hero-art]"))).toBeLessThanOrEqual(await top(controls));
      expect(await bottom(controls)).toBeLessThanOrEqual(await top(hero.getByRole("link", { name: "Explorer la carte" })));
    });
  });
});
