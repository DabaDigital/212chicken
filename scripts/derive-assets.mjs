/**
 * Derived runtime assets, generated from the asset pack at build time (never edited by hand):
 *
 * 1. Hero layers. The exploded burger frame is split along its OWN transparent gaps (alpha
 *    connected components) into three disjoint layers: the upper stack (top bun, lettuce, tomato,
 *    cheese and chicken overlap, so they stay one piece), the bottom bun, and the garnish (sauce
 *    drop + crumbs). No object is cut: every pixel belongs to exactly one layer and the three
 *    layers recompose the original frame exactly (verified below, the build fails otherwise).
 * 2. Visual bounds (alpha bounding boxes) used to size art without cropping ingredient edges, and
 *    per-photo scale factors for product photos with unusually large transparent padding.
 * 3. Campaign art supplied by the owner, trimmed and converted to WebP (see deriveCampaignArt).
 *
 * Output: public/212/images/hero/layers/*.webp, public/212/images/campaign/*.webp and
 * src/generated/asset-metrics.json.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ALPHA_SOLID = 24;
const LAYER_IDS = ["bun", "stack", "garnish"]; // paint order: back → front

async function rawRgba(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** Inclusive pixel box of the pixels whose alpha exceeds `threshold` (x1 = -1 when there are none). */
function pixelBounds(data, width, height, threshold = ALPHA_SOLID) {
  let x0 = width, y0 = height, x1 = -1, y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > threshold) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  return { x0, y0, x1, y1 };
}

function alphaBounds(data, width, height, threshold = ALPHA_SOLID) {
  const { x0, y0, x1, y1 } = pixelBounds(data, width, height, threshold);
  const r = (v) => Math.round(v * 1000) / 1000;
  return { x0: r(x0 / width), y0: r(y0 / height), x1: r((x1 + 1) / width), y1: r((y1 + 1) / height) };
}

/** Labels 8-connected components of solid alpha, then gives every soft pixel to its nearest component. */
function labelComponents(data, width, height) {
  const n = width * height;
  const label = new Int32Array(n).fill(-1);
  const sizes = [];
  const stack = [];
  for (let i = 0; i < n; i++) {
    if (label[i] !== -1 || data[i * 4 + 3] <= ALPHA_SOLID) continue;
    const id = sizes.length;
    let count = 0;
    label[i] = id;
    stack.push(i);
    while (stack.length) {
      const p = stack.pop();
      count++;
      const x = p % width;
      const y = (p - x) / width;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= width || yy >= height) continue;
          const q = yy * width + xx;
          if (label[q] === -1 && data[q * 4 + 3] > ALPHA_SOLID) {
            label[q] = id;
            stack.push(q);
          }
        }
      }
    }
    sizes.push(count);
  }
  // Multi-source BFS: soft edge / halo pixels (0 < alpha ≤ threshold) join the nearest component.
  let frontier = [];
  for (let i = 0; i < n; i++) if (label[i] !== -1) frontier.push(i);
  while (frontier.length) {
    const next = [];
    for (const p of frontier) {
      const x = p % width;
      const y = (p - x) / width;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= width || yy >= height) continue;
        const q = yy * width + xx;
        if (label[q] === -1 && data[q * 4 + 3] > 0) {
          label[q] = label[p];
          next.push(q);
        }
      }
    }
    frontier = next;
  }
  // Isolated faint specks (not connected to any component) form one extra "stray" group.
  const strayId = sizes.length;
  let strays = 0;
  for (let i = 0; i < n; i++) {
    if (label[i] === -1 && data[i * 4 + 3] > 0) {
      label[i] = strayId;
      strays++;
    }
  }
  if (strays) sizes.push(strays);
  return { label, sizes };
}

async function writeIfChanged(file, buffer) {
  if (existsSync(file) && (await readFile(file)).equals(buffer)) return false;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, buffer);
  return true;
}

async function deriveHeroLayers(assetRoot, publicDir) {
  const source = "images/hero/burger-exploded.png";
  const { data, width, height } = await rawRgba(path.join(assetRoot, source));
  const { label, sizes } = labelComponents(data, width, height);

  const bySize = sizes.map((size, id) => ({ id, size })).sort((a, b) => b.size - a.size);
  const stackId = bySize[0]?.id;
  const bunId = bySize[1]?.id;
  if (stackId === undefined || bunId === undefined) throw new Error("hero layers: expected at least two components");

  const group = (id) => (id === bunId ? 0 : id === stackId ? 1 : 2);
  const buffers = LAYER_IDS.map(() => Buffer.alloc(width * height * 4));
  for (let i = 0; i < width * height; i++) {
    if (label[i] === -1) continue; // fully transparent
    data.copy(buffers[group(label[i])], i * 4, i * 4, i * 4 + 4);
  }

  // Exactness check: the disjoint layers must recompose the source pixel for pixel.
  for (let i = 0; i < width * height * 4; i++) {
    const recomposed = buffers[0][i] | buffers[1][i] | buffers[2][i];
    const expected = data[(i - (i % 4)) + 3] === 0 ? 0 : data[i];
    if (recomposed !== expected) throw new Error(`hero layers: recomposition differs at byte ${i}`);
  }

  // Sanity check: the bottom bun must sit below the stack (otherwise the art changed: re-check).
  const layers = [];
  let written = 0;
  for (let g = 0; g < LAYER_IDS.length; g++) {
    const bounds = alphaBounds(buffers[g], width, height, 0);
    const webp = await sharp(buffers[g], { raw: { width, height, channels: 4 } })
      .webp({ quality: 92, alphaQuality: 100, effort: 5 })
      .toBuffer();
    const rel = `images/hero/layers/${LAYER_IDS[g]}.webp`;
    if (await writeIfChanged(path.join(publicDir, rel), webp)) written++;
    layers.push({ id: LAYER_IDS[g], path: rel, bounds });
  }
  const [bun, stack] = layers;
  if (!(bun.bounds.y0 > stack.bounds.y0 + 0.4)) throw new Error("hero layers: bottom bun not below the stack");

  return {
    heroLayers: { source, width, height, layers, components: sizes.length },
    heroBounds: alphaBounds(data, width, height),
    files: layers.map((layer) => layer.path),
    written,
  };
}

/**
 * Campaign art supplied by the owner (212-chicken-assets/campaign/, see its README): trimmed to the
 * visible pixels and converted to WebP. `isolate: "rightmost"` keeps only the right-hand subject of a
 * composition: its largest component in the right 30% plus every component starting at or right of
 * it. The cup thus leaves the box-and-cup art whole, splash included, and no neighbouring food is cut.
 */
const CAMPAIGN_ART = [
  { id: "boxExplosion", source: "box-explosion.png", output: "images/campaign/box-explosion.webp" },
  { id: "tendersDip", source: "tenders-dip.png", output: "images/campaign/tenders-dip.webp" },
  { id: "cup", source: "box-and-cup.png", output: "images/campaign/cup.webp", isolate: "rightmost" },
  { id: "neon", source: "neon-good-mood.png", output: "images/campaign/neon-good-mood.webp" },
];
const TRIM_ALPHA = 8;
const TRIM_PADDING = 6;

function isolateRightmost(data, width, height) {
  const { label, sizes } = labelComponents(data, width, height);
  const spans = sizes.map(() => ({ x0: width, x1: -1 }));
  for (let i = 0; i < width * height; i++) {
    const span = spans[label[i]];
    if (!span) continue;
    const x = i % width;
    if (x < span.x0) span.x0 = x;
    if (x > span.x1) span.x1 = x;
  }
  const subject = spans
    .map((span, id) => ({ ...span, size: sizes[id] }))
    .filter((span) => (span.x0 + span.x1) / 2 > width * 0.7)
    .sort((a, b) => b.size - a.size)[0];
  if (!subject) throw new Error("campaign art: no subject in the right 30% of the composition");
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < width * height; i++) {
    const span = spans[label[i]];
    if (span && span.x0 >= subject.x0) data.copy(out, i * 4, i * 4, i * 4 + 4);
  }
  return out;
}

async function deriveCampaignArt(campaignRoot, publicDir) {
  const art = {};
  let written = 0;
  for (const { id, source, output, isolate } of CAMPAIGN_ART) {
    const file = path.join(campaignRoot, source);
    if (!existsSync(file)) throw new Error(`campaign art: missing ${file}`);
    const raw = await rawRgba(file);
    const { width, height } = raw;
    const corners = [0, width - 1, (height - 1) * width, height * width - 1].map((i) => raw.data[i * 4 + 3]);
    if (corners.every((alpha) => alpha === 255)) throw new Error(`campaign art: ${source} needs a transparent background`);

    const data = isolate === "rightmost" ? isolateRightmost(raw.data, width, height) : raw.data;
    const box = pixelBounds(data, width, height, TRIM_ALPHA);
    if (box.x1 < 0) throw new Error(`campaign art: ${source} has no visible pixels`);
    const left = Math.max(0, box.x0 - TRIM_PADDING);
    const top = Math.max(0, box.y0 - TRIM_PADDING);
    const crop = {
      left,
      top,
      width: Math.min(width, box.x1 + 1 + TRIM_PADDING) - left,
      height: Math.min(height, box.y1 + 1 + TRIM_PADDING) - top,
    };
    const webp = await sharp(data, { raw: { width, height, channels: 4 } })
      .extract(crop)
      .webp({ quality: 90, alphaQuality: 100, effort: 5 })
      .toBuffer();
    if (await writeIfChanged(path.join(publicDir, output), webp)) written++;
    art[id] = { source, path: output, width: crop.width, height: crop.height };
  }
  return { art, files: CAMPAIGN_ART.map((entry) => entry.output), written };
}

/** Scale factor for product photos whose subject fills < 80% of the square (e.g. small desserts). */
async function deriveProductScales(assetRoot, products) {
  const scales = {};
  const bounds = {};
  for (const product of products) {
    const { data, width, height } = await rawRgba(path.join(assetRoot, product.image));
    const b = alphaBounds(data, width, height);
    bounds[product.id] = b;
    const fill = Math.max(b.x1 - b.x0, b.y1 - b.y0);
    if (fill >= 0.8) continue;
    // Largest scale (around the centre) that keeps every edge inside a 1.5% safety margin.
    const limit = Math.min(...[b.x0, b.y0, 1 - b.x1, 1 - b.y1].map((edge) => 0.485 / (0.5 - edge)));
    const scale = Math.min(0.86 / fill, limit);
    if (scale >= 1.04) scales[product.id] = Math.round(scale * 100) / 100;
  }
  return { productImageScale: scales, productBounds: bounds };
}

export async function deriveAssets({ assetRoot, campaignRoot, publicDir, generatedFile, products }) {
  const hero = await deriveHeroLayers(assetRoot, publicDir);
  const campaign = await deriveCampaignArt(campaignRoot, publicDir);
  const productMetrics = await deriveProductScales(assetRoot, products);
  const metrics = {
    heroBounds: hero.heroBounds,
    heroLayers: hero.heroLayers,
    productImageScale: productMetrics.productImageScale,
    campaign: campaign.art,
  };
  const json = Buffer.from(`${JSON.stringify(metrics, null, 2)}\n`);
  const metricsChanged = await writeIfChanged(generatedFile, json);
  return {
    files: hero.files,
    written: hero.written,
    campaign: { files: campaign.files, written: campaign.written },
    metricsChanged,
    scaled: Object.keys(productMetrics.productImageScale),
  };
}
