import { expect, test, type Page } from "@playwright/test";

const productCards = (page: Page) => page.locator("main article");

test.describe("La carte", () => {
  test("lists every source product in one grid with display category labels", async ({ page }) => {
    await page.goto("/carte");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/La carte/);
    await expect(productCards(page)).toHaveCount(25);
    await expect(page.getByRole("status").first()).toHaveText("25 produits");
    // 9 display categories (8 source categories + proposed "Wraps").
    await expect(page.getByRole("group", { name: "Catégories" }).getByRole("button")).toHaveCount(10);
    await expect(page.getByRole("region", { name: "Tous les produits" }).locator("article")).toHaveCount(25);
    await expect(page.getByText("149 DH")).toBeVisible();
  });

  test("filters by category, keeps one active state and syncs the URL", async ({ page }) => {
    await page.goto("/carte");
    const filters = page.getByRole("group", { name: "Catégories" });
    await filters.getByRole("button", { name: /^Wraps/ }).click();

    await expect(filters.getByRole("button", { name: /^Wraps/ })).toHaveAttribute("aria-pressed", "true");
    await expect(filters.locator("button[aria-pressed='true']")).toHaveCount(1);
    await expect(productCards(page)).toHaveCount(1);
    await expect(productCards(page).first()).toContainText("Royal 212 Wistor");
    await expect(page).toHaveURL(/\?categorie=wraps$/);

    await filters.getByRole("button", { name: /^Tout/ }).click();
    await expect(productCards(page)).toHaveCount(25);
    await expect(page).toHaveURL(/\/carte$/);
  });

  test("Royal 212 Wistor appears under Wraps, not Burgers", async ({ page }) => {
    await page.goto("/carte?categorie=burger");
    const filters = page.getByRole("group", { name: "Catégories" });
    await expect(filters.getByRole("button", { name: /^Burgers/ })).toHaveAttribute("aria-pressed", "true");
    await expect(productCards(page)).toHaveCount(4);
    await expect(page.getByRole("button", { name: /Royal 212 Wistor/ })).toHaveCount(0);
  });

  test("searches accent-insensitively and offers a way out of empty results", async ({ page }) => {
    await page.goto("/carte");
    const search = page.getByLabel("Rechercher sur la carte");

    await search.fill("cesar");
    await expect(productCards(page)).toHaveCount(1);
    await expect(productCards(page).first()).toContainText("Salade César");

    await search.fill("tiramisu");
    await expect(productCards(page)).toHaveCount(4);
    await expect(page.getByRole("status").first()).toContainText("4 résultats pour « tiramisu »");

    await search.fill("introuvable");
    await expect(productCards(page)).toHaveCount(0);
    await expect(page.getByText("Aucun produit ne correspond à votre recherche.")).toBeVisible();
    await page.getByRole("button", { name: "Effacer la recherche" }).first().click();
    await expect(search).toHaveValue("");
    await expect(search).toBeFocused();
    await expect(productCards(page)).toHaveCount(25);
  });

  test("product dialog shows published data, closes on Escape and restores focus", async ({ page }) => {
    await page.goto("/carte");
    const trigger = page.getByRole("button", { name: /Royal Crunch Double/ });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Royal Crunch Double" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Poulet pané double, cheddar, sauce 212 au choix.");
    await expect(dialog).toContainText("39 DH");
    await expect(dialog).toContainText("Supplément menu");
    await expect(dialog).toContainText("+16 DH");
    await expect(dialog.getByRole("link", { name: "Trouver un restaurant" })).toHaveAttribute("href", "/restaurants");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("dialog keeps focus inside and closes with its button", async ({ page }) => {
    await page.goto("/carte");
    await page.getByRole("button", { name: /Mac and Cheese/ }).click();
    const dialog = page.getByRole("dialog", { name: "Mac and Cheese" });
    await expect(dialog).toBeVisible();
    // No published description or supplement: nothing is invented.
    await expect(dialog).not.toContainText("Supplément menu");
    await expect(dialog.locator("p")).toHaveCount(1); // category label only

    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press("Tab");
      const inside = await dialog.evaluate((node) => node.contains(document.activeElement));
      expect(inside).toBe(true);
    }
    await dialog.getByRole("button", { name: "Fermer" }).click();
    await expect(dialog).toBeHidden();
  });

  test("never offers a fake cart or ordering action", async ({ page }) => {
    await page.goto("/carte");
    await expect(page.getByText(/ajouter au panier/i)).toHaveCount(0);
    await expect(page.getByRole("link", { name: /^Commander/ })).toHaveCount(0);
  });

  test("combines filters and search, preserves both after details, and resets empty results", async ({ page }) => {
    await page.goto("/carte");
    const search = page.getByLabel("Rechercher sur la carte");
    const filters = page.getByRole("group", { name: "Catégories" });
    await filters.getByRole("button", { name: /^Burgers/ }).click();
    await search.fill("crunch");
    await expect(productCards(page)).toHaveCount(1);
    await page.getByRole("button", { name: /Royal Crunch Double/ }).click();
    await page.keyboard.press("Escape");
    await expect(search).toHaveValue("crunch");
    await expect(filters.getByRole("button", { name: /^Burgers/ })).toHaveAttribute("aria-pressed", "true");
    await search.fill("tiramisu");
    await expect(productCards(page)).toHaveCount(0);
    await page.getByRole("button", { name: "Réinitialiser les filtres" }).click();
    await expect(search).toHaveValue("");
    await expect(productCards(page)).toHaveCount(25);
    await expect(page).toHaveURL(/\/carte$/);
  });

  test("scrolling category controls stay reachable and reorient to filtered results", async ({ page }) => {
    await page.goto("/carte");
    await productCards(page).last().scrollIntoViewIfNeeded();
    const filters = page.getByRole("group", { name: "Catégories" });
    const bounds = await filters.boundingBox();
    expect(bounds?.y).toBeLessThan(30);
    await filters.getByRole("button", { name: /^Wraps/ }).click();
    await expect(productCards(page)).toHaveCount(1);
    await expect(productCards(page).first()).toBeInViewport();
  });
});

test.describe("Home selection", () => {
  test("filters the selection and links to the matching category of the full menu", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#selection");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("À chacun son crunch.");
    await expect(section.locator("article")).toHaveCount(6);

    await section.getByRole("button", { name: "Wraps" }).click();
    await expect(section.locator("article")).toHaveCount(1);
    await expect(section.getByRole("link", { name: "Voir la catégorie Wraps" })).toHaveAttribute(
      "href",
      "/carte?categorie=wraps",
    );

    await section.getByRole("link", { name: "Voir la catégorie Wraps" }).click();
    await expect(page).toHaveURL(/\/carte\?categorie=wraps$/);
    await expect(productCards(page)).toHaveCount(1);
  });
});
