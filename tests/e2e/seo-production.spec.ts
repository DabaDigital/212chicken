import { expect, test } from "@playwright/test";

test.describe("Production search signals", () => {
  test.skip(process.env.SITE_INDEXABLE !== "true" || !process.env.SITE_URL, "Requires a simulated production build");

  test("canonical, sitemap and robots agree on the production domain", async ({ page, request }) => {
    const origin = new URL(process.env.SITE_URL!).origin;
    await page.goto("/carte?categorie=burger");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${origin}/carte`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain(`Sitemap: ${origin}/sitemap.xml`);
    expect(robots).not.toContain("Disallow: /");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap.match(/<loc>/g)).toHaveLength(12);
    expect(sitemap).toContain(`${origin}/restaurants/maarif`);
    expect(sitemap).not.toContain("rabat-agdal");
  });

  test("restaurant and menu schema describe the rendered content", async ({ page }) => {
    await page.goto("/restaurants/maarif");
    const graphs = await page.locator('script[type="application/ld+json"]').allTextContents();
    const restaurant = graphs.map((value) => JSON.parse(value)).find((value) => value["@type"] === "Restaurant");
    expect(restaurant.address.streetAddress).toBe("203 Bd Mohammed Zerktouni");
    expect(restaurant.address.addressCountry).toBe("MA");
    expect(restaurant).not.toHaveProperty("aggregateRating");
    expect(restaurant).not.toHaveProperty("openingHoursSpecification");
    await expect(page.locator("address")).toContainText(restaurant.address.streetAddress);
    await page.goto("/carte");
    const menuGraphs = await page.locator('script[type="application/ld+json"]').allTextContents();
    const menu = menuGraphs.map((value) => JSON.parse(value)).find((value) => value["@type"] === "Menu");
    const items = menu.hasMenuSection.flatMap((section: { hasMenuItem: { name: string; offers: { price: number; priceCurrency: string } }[] }) => section.hasMenuItem);
    expect(items).toHaveLength(25);
    for (const item of items) {
      expect(item.offers.priceCurrency).toBe("MAD");
      expect(item.offers.price).toBeGreaterThan(0);
      await expect(page.getByRole("heading", { name: `${item.name} — voir le détail`, exact: true })).toBeVisible();
    }
  });
});
