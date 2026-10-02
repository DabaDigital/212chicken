#!/usr/bin/env node
/**
 * Copies the runtime subset of the 212 Chicken asset pack into /public/212
 * and regenerates the app icons from the brand logo.
 *
 * - The asset pack stays the single source of truth (it is never modified).
 * - Only WebP files referenced by the data (products, confirmed restaurant photos) plus
 *   brand/hero/decor files are copied.
 * - Every referenced path is verified; a missing file fails the build.
 * - Files in /public/212 that are no longer referenced are removed.
 *
 * ASSET_ROOT is also referenced statically by:
 *   - tsconfig.json  ("@pack/*" alias, used by src/lib/source-data.ts)
 *   - src/app/fonts.ts (next/font/local needs literal relative paths)
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import { deriveAssets } from "./derive-assets.mjs";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSET_ROOT = path.join(PROJECT_ROOT, "212-chicken-assets", "212-chicken-assets");
// Owner-supplied campaign art, kept beside the pack (see its README); converted by derive-assets.mjs.
const CAMPAIGN_ROOT = path.join(PROJECT_ROOT, "212-chicken-assets", "campaign");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public", "212");
const APP_DIR = path.join(PROJECT_ROOT, "src", "app");
const GENERATED_METRICS = path.join(PROJECT_ROOT, "src", "generated", "asset-metrics.json");

const STATIC_RUNTIME_FILES = [
  "images/brand/logo-original.webp",
  "images/brand/logo.png",
  "images/hero/burger-exploded.webp",
  "images/hero/burger-assembled.webp",
  "images/decor/floating-fries.webp",
];

function fail(message) {
  console.error(`\n[assets] ${message}\n`);
  process.exit(1);
}

async function sha256(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

async function listFiles(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? listFiles(full) : [full];
    }),
  );
  return nested.flat();
}

async function main() {
  if (!existsSync(path.join(ASSET_ROOT, "data", "menu.json"))) {
    fail(
      `Asset pack not found at ${path.relative(PROJECT_ROOT, ASSET_ROOT)}.\n` +
        "If the pack moved, update ASSET_ROOT here, the \"@pack/*\" alias in tsconfig.json and the font paths in src/app/fonts.ts.",
    );
  }

  const menu = JSON.parse(await readFile(path.join(ASSET_ROOT, "data", "menu.json"), "utf8"));
  const manifest = JSON.parse(await readFile(path.join(ASSET_ROOT, "data", "asset-manifest.json"), "utf8"));
  const manifestPaths = new Map(manifest.map((entry) => [entry.path, entry]));

  const website = JSON.parse(await readFile(path.join(ASSET_ROOT, "data", "website.json"), "utf8"));

  const productImages = menu.products.map((product) => product.image);
  // Storefront photos of confirmed restaurant entries (see src/lib/restaurants.ts); none in the snapshot.
  const restaurantPhotos = (website.restaurants ?? [])
    .filter((entry) => entry?.verified === true && typeof entry.photo === "string")
    .map((entry) => entry.photo);
  const runtimeFiles = [...new Set([...STATIC_RUNTIME_FILES, ...productImages, ...restaurantPhotos])];

  const problems = [];
  for (const rel of runtimeFiles) {
    if (!rel.startsWith("images/") || rel.includes("..")) problems.push(`Unexpected asset path: ${rel}`);
    else if (!existsSync(path.join(ASSET_ROOT, rel))) problems.push(`Missing file: ${rel}`);
    else if (!manifestPaths.has(rel)) console.warn(`[assets] warning: ${rel} is not listed in asset-manifest.json`);
  }
  if (problems.length) fail(problems.join("\n"));

  let copied = 0;
  for (const rel of runtimeFiles) {
    const source = path.join(ASSET_ROOT, rel);
    const target = path.join(PUBLIC_DIR, rel);
    const expected = manifestPaths.get(rel)?.sha256;
    if (expected && (await sha256(source)) !== expected) {
      console.warn(`[assets] warning: ${rel} differs from the sha256 recorded in asset-manifest.json`);
    }
    if (existsSync(target)) {
      const [a, b] = await Promise.all([stat(source), stat(target)]);
      if (a.size === b.size && (await sha256(source)) === (await sha256(target))) continue;
    }
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(source, target);
    copied++;
  }

  const derived = await deriveAssets({
    assetRoot: ASSET_ROOT,
    campaignRoot: CAMPAIGN_ROOT,
    publicDir: PUBLIC_DIR,
    generatedFile: GENERATED_METRICS,
    products: menu.products,
  });

  const wanted = new Set(
    [...runtimeFiles, ...derived.files, ...derived.campaign.files].map((rel) => path.join(PUBLIC_DIR, rel)),
  );
  let removed = 0;
  for (const file of await listFiles(PUBLIC_DIR)) {
    if (!wanted.has(file)) {
      await rm(file);
      removed++;
    }
  }

  // App icons: the full vertical logo on a cream square (no cropping or recolouring of the mark).
  const logo = path.join(ASSET_ROOT, "images", "brand", "logo.png");
  const icons = [
    { file: "icon.png", size: 96, logoHeightRatio: 0.92 },
    { file: "apple-icon.png", size: 180, logoHeightRatio: 0.8 },
  ];
  for (const { file, size, logoHeightRatio } of icons) {
    const logoHeight = Math.round(size * logoHeightRatio);
    const resized = await sharp(logo).resize({ height: logoHeight, kernel: "lanczos3" }).png().toBuffer();
    const { width: logoWidth = 0 } = await sharp(resized).metadata();
    const png = await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 255, g: 248, b: 232, alpha: 1 } },
    })
      .composite([{ input: resized, left: Math.round((size - logoWidth) / 2), top: Math.round((size - logoHeight) / 2) }])
      .png({ compressionLevel: 9 })
      .toBuffer();
    const target = path.join(APP_DIR, file);
    if (!existsSync(target) || !(await readFile(target)).equals(png)) await writeFile(target, png);
  }

  console.log(
    `[assets] ${runtimeFiles.length} runtime files verified (${copied} copied, ${removed} stale removed) → public/212`,
  );
  console.log(
    `[assets] hero layers ${derived.files.length} (${derived.written} written, recomposition exact); ` +
      `scaled product photos: ${derived.scaled.join(", ") || "none"}${derived.metricsChanged ? " · metrics updated" : ""}`,
  );
  console.log(
    `[assets] campaign art ${derived.campaign.files.length} (${derived.campaign.written} written) → public/212/images/campaign`,
  );
}

main().catch((error) => fail(error instanceof Error ? error.stack ?? error.message : String(error)));
