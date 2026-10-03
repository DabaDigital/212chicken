import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/carte", "/restaurants", "/restaurants/maarif"];
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("Accessibility (axe-core)", () => {
  for (const path of ROUTES) {
    test(`no WCAG A/AA violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      const summary = results.violations.map((violation) => `${violation.id}: ${violation.nodes.length} node(s)`);
      expect(summary).toEqual([]);
    });
  }

  test("no violations with the product dialog open", async ({ page }) => {
    await page.goto("/carte");
    await page.getByRole("button", { name: /Box N°1/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });

  test("interactive targets are at least 44 × 44 CSS px", async ({ page }) => {
    for (const path of ROUTES) {
      await page.goto(path);
      const small = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("main a, main button, header a, header button, footer a")]
          .filter((element) => {
            const style = getComputedStyle(element);
            if (style.display === "none" || style.visibility === "hidden") return false;
            if (element.closest(".sr-only") || element.classList.contains("skip-link")) return false;
            // Product cards use a stretched ::after: the whole card is the hit area.
            const after = getComputedStyle(element, "::after");
            const card = element.closest("article");
            const rect =
              after.position === "absolute" && after.content !== "none" && card
                ? card.getBoundingClientRect()
                : element.getBoundingClientRect();
            return rect.width > 0 && (rect.width < 44 || rect.height < 44);
          })
          .map((element) => `${element.tagName.toLowerCase()} "${element.textContent?.trim().slice(0, 40)}"`),
      );
      expect(small, `small targets on ${path}`).toEqual([]);
    }
  });
});

test.describe("SEO basics", () => {
  for (const path of ROUTES) {
    test(`unique title, description, single h1 and French language on ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", "fr-MA");
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page).toHaveTitle(/212 Chicken/);
      const description = await page.locator('meta[name="description"]').getAttribute("content");
      expect(description?.length ?? 0).toBeGreaterThan(50);
    });
  }

  test("route titles are unique", async ({ page }) => {
    const titles = new Set<string>();
    for (const path of ROUTES) {
      await page.goto(path);
      titles.add(await page.title());
    }
    expect(titles.size).toBe(ROUTES.length);
  });

  test("previews without SITE_URL / SITE_INDEXABLE stay out of search engines", async ({ page, request }) => {
    test.skip(Boolean(process.env.SITE_INDEXABLE), "Production configuration under test");
    await page.goto("/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \//);
  });
});
