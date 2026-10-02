import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end checks for the real user journeys (menu filters, search, product dialog, navigation)
 * plus axe accessibility scans. Runs against a production server by default:
 *
 *   npm run build && npm run test:e2e
 *
 * Set BASE_URL to test an already running server (e.g. `next dev`). Uses a locally installed
 * Chromium browser through BROWSER_CHANNEL (default "msedge"; "chrome" also works).
 */
const PORT = Number(process.env.PORT ?? 3100);
const baseURL = process.env.BASE_URL ?? `http://localhost:${PORT}`;
const channel = process.env.BROWSER_CHANNEL ?? "msedge";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL,
    channel,
    locale: "fr-MA",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], channel, viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], channel },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npx next start -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
