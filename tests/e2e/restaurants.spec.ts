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
    const mapLinks = directory.getByRole("link", { name: /voir sur Google Maps/ });
    for (const link of await mapLinks.all()) {
      const url = new URL((await link.getAttribute("href"))!);
      expect(url.searchParams.get("query_place_id")).toMatch(/^ChIJ/);
      expect(url.hostname).toBe("www.google.com");
    }
  }

  await filters.getByRole("button", { name: "Tous", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(directory.getByRole("article")).toHaveCount(9);
});
