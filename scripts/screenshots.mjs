#!/usr/bin/env node
/**
 * Visual QA helper: full-page screenshots of every route at the test widths, plus automatic checks
 * for horizontal overflow, console errors, failed requests and broken images.
 *
 *   BASE_URL=http://localhost:3000 node scripts/screenshots.mjs [--routes=/,/carte] [--widths=390,1440] [--motion]
 *
 * Uses a locally installed Chromium browser through a Playwright channel (BROWSER_CHANNEL, default
 * "msedge"; "chrome" also works), so no browser download is needed. Output: ./screenshots/
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value];
  }),
);

const routes = (args.routes ?? "/,/carte,/restaurants,/page-inexistante").split(",");
const viewports = (args.widths ?? "320,375,390,430,768,1024,1440,1920")
  .split(",")
  .map((width) => {
    if (width === "landscape") return { name: "landscape-844x390", width: 844, height: 390, mobile: true };
    const w = Number(width);
    return { name: `${w}`, width: w, height: w < 768 ? 844 : w < 1024 ? 1024 : 900, mobile: w < 768 };
  });
if (args.landscape) viewports.push({ name: "landscape-844x390", width: 844, height: 390, mobile: true });

const outDir = path.resolve("screenshots");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? "msedge" });
const problems = [];

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    hasTouch: viewport.mobile,
    isMobile: viewport.mobile,
    reducedMotion: args.motion ? "no-preference" : "reduce",
  });
  for (const route of routes) {
    const page = await context.newPage();
    const consoleErrors = [];
    const expectNotFound = route.includes("page-inexistante");
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      // The 404 route's own document status is expected; anything else is reported.
      if (expectNotFound && message.text().includes("status of 404")) return;
      consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));
    page.on("requestfailed", (request) => {
      // Next.js cancels in-flight route prefetches (?_rsc=) when it no longer needs them.
      if (request.url().includes("_rsc=") && request.failure()?.errorText.includes("ERR_ABORTED")) return;
      consoleErrors.push(`requestfailed: ${request.url()} (${request.failure()?.errorText ?? "unknown"})`);
    });
    page.on("response", (response) => {
      if (response.status() >= 400 && !response.url().includes("page-inexistante")) {
        consoleErrors.push(`HTTP ${response.status()}: ${response.url()}`);
      }
    });

    await page.goto(new URL(route, BASE_URL).toString(), { waitUntil: "networkidle" });
    // Scroll through the page so lazy images load, then return to the top.
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.8) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(400);

    const checks = await page.evaluate(() => {
      const doc = document.documentElement;
      const broken = [...document.images]
        .filter((img) => img.complete && img.naturalWidth === 0 && getComputedStyle(img).display !== "none")
        .map((img) => img.currentSrc || img.src);
      return { overflowX: doc.scrollWidth - window.innerWidth, broken, height: doc.scrollHeight };
    });

    const slug = route === "/" ? "home" : route.replace(/\//g, "") || "home";
    const file = path.join(outDir, `${slug}-${viewport.name}.png`);
    await page.screenshot({ path: file, fullPage: true });

    const tag = `${route} @ ${viewport.name}`;
    if (checks.overflowX > 0) problems.push(`${tag}: horizontal overflow ${checks.overflowX}px`);
    if (checks.broken.length) problems.push(`${tag}: broken images ${checks.broken.join(", ")}`);
    for (const error of consoleErrors) problems.push(`${tag}: ${error}`);
    console.log(`✓ ${tag} → ${path.relative(process.cwd(), file)} (${checks.height}px tall)`);
    await page.close();
  }
  await context.close();
}

await browser.close();
if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log("\nNo overflow, console errors, failed requests or broken images detected.");
}
