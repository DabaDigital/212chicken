import { expect, test } from "@playwright/test";

const MAPS_SEARCH_PREFIX = "https://www.google.com/maps/search/212+chicken/";

test.describe("Navigation and calls to action", () => {
  test("hero CTAs lead to the menu and the restaurant finder", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("ÇA CROQUE. ÇA CLAQUE.");
    await expect(page.getByText("Du poulet croustillant. Du goût. Du vrai.").first()).toBeVisible();

    const hero = page.locator("[data-hero]");
    await expect(hero.getByRole("link", { name: "Explorer la carte" })).toHaveAttribute("href", "/carte");
    await expect(hero.getByRole("link", { name: "Trouver un restaurant" })).toHaveAttribute("href", "/restaurants");
  });

  test("header CTA never pretends ordering works", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    await expect(header.getByRole("link", { name: /Voir la carte|La carte/ }).last()).toHaveAttribute("href", "/carte");
    await expect(header.getByText("Commander")).toHaveCount(0);

    await page.goto("/carte");
    await expect(page.getByRole("banner").getByRole("link", { name: /Trouver un restaurant|Restaurants/ })).toHaveAttribute(
      "href",
      "/restaurants",
    );
  });

  test("skip link moves focus to the main content", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Keyboard focus order check");
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Aller au contenu" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#contenu")).toBeFocused();
  });

  test("restaurant page offers the supplied map search and invents no locations", async ({ page }) => {
    await page.goto("/restaurants");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Nos restaurants/);
    const maps = page.getByRole("link", { name: /Rechercher sur Google Maps/ });
    await expect(maps).toHaveAttribute("href", new RegExp(`^${MAPS_SEARCH_PREFIX.replace(/[.+?/]/g, "\\$&")}`));
    await expect(maps).toHaveAttribute("target", "_blank");
    await expect(maps).toHaveAttribute("rel", /noopener/);
    // No unverified business data on the page.
    await expect(page.getByText(/ouvert maintenant|horaires|\+212|\+33/i)).toHaveCount(0);
  });

  test("unknown routes render the branded 404", async ({ page }) => {
    const response = await page.goto("/page-qui-n-existe-pas");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("croquer");
  });
});

test.describe("Mobile menu", () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(!isMobile, "The menu toggle only exists below 768px");
  });

  test("opens, traps focus, closes on Escape and returns focus", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Ouvrir le menu" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();

    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(menu.getByRole("link", { name: "La carte" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
  });

  test("navigates and closes when a link is chosen", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Nos restaurants" }).click();
    await expect(page).toHaveURL(/\/restaurants$/);
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  });
});

test.describe("Layout", () => {
  for (const path of ["/", "/carte", "/restaurants"]) {
    test(`no horizontal overflow on ${path}`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
