import { expect, test } from "@playwright/test";

test("city filters show the supplied branches and preserve their map destinations", async ({ page }) => {
  await page.goto("/restaurants");
  const directory = page.getByRole("region", { name: "Nos adresses", exact: true });
  const filters = directory.getByRole("group", { name: "Filtrer les restaurants par ville" });
  await expect(directory.getByRole("article")).toHaveCount(9);
  await expect(filters.getByRole("button", { name: "Rabat", exact: true })).toHaveCount(0);

  for (const [city, count] of [["Casablanca", 6], ["Tanger", 1], ["Marrakech", 1], ["Bouskoura", 1]] as const) {
    await filters.getByRole("button", { name: city, exact: true }).click();
    await expect(filters.getByRole("button", { name: city, exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(directory.getByRole("article")).toHaveCount(count);
    await expect(directory.getByRole("status")).toContainText(city);
    const links = directory.getByRole("link", { name: /adresse et horaires/ });
    await expect(links).toHaveCount(count);
    for (const link of await links.all()) {
      expect(await link.getAttribute("href")).toMatch(/^\/restaurants\/[a-z0-9-]+$/);
    }
  }

  await filters.getByRole("button", { name: "Tous", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(directory.getByRole("article")).toHaveCount(9);
});

test("a branch page preserves directions and rejects unpublished locations", async ({ page, request }) => {
  await page.goto("/restaurants");
  await page.getByRole("link", { name: /Maarif — adresse et horaires/ }).click();
  await expect(page).toHaveURL(/\/restaurants\/maarif$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("212 Chicken Maarif");
  await expect(page.locator("address")).toContainText("203 Bd Mohammed Zerktouni");
  const directions = page.getByRole("link", { name: /Itinéraire Google Maps/ });
  const destination = new URL((await directions.getAttribute("href"))!);
  expect(destination.searchParams.get("query_place_id")).toBe("ChIJc44TUwDTpw0RB8WbXEdH-jE");
  expect((await request.get("/restaurants/rabat-agdal")).status()).toBe(404);
});
