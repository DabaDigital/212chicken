/**
 * Regenerates the Latin subsets loaded by src/app/fonts.ts: `node scripts/subset-fonts.mjs`.
 *
 * The asset-pack WOFF2 files also carry Cyrillic and Vietnamese glyphs the French site never renders;
 * dropping them halves the font bytes that compete with the hero photo on first load. The kept ranges
 * cover French (incl. œ, Ÿ), typographic punctuation and spaces, €, and a few UI symbols. A character
 * outside them falls back to the next font in the stack instead of disappearing.
 *
 * Runs on WebAssembly (harfbuzzjs), so no Python or native binary is needed. Original fonts and the
 * OFL licences stay in the asset pack; the generated files are committed.
 */
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import subsetFont from "subset-font";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "212-chicken-assets/212-chicken-assets/fonts");
const target = path.join(root, "src/app/font-assets");

const ranges = [
  [0x0020, 0x007e], // Basic Latin
  [0x00a0, 0x00ff], // Latin-1: French accents, « », °, ×, ÷
  [0x0152, 0x0153], // Œ œ
  [0x0178, 0x0178], // Ÿ
  [0x0300, 0x036f], // combining accents (decomposed input)
  [0x2000, 0x206f], // spaces (incl. narrow no-break), dashes, quotes, bullet, ellipsis
  [0x20ac, 0x20ac], // €
  [0x2122, 0x2122], // ™
  [0x2190, 0x2193], // arrows
  [0x2212, 0x2212], // minus
  [0x2248, 0x2248], // ≈
  [0x2264, 0x2265], // ≤ ≥
];
const text = ranges
  .flatMap(([first, last]) => Array.from({ length: last - first + 1 }, (_, i) => String.fromCodePoint(first + i)))
  .join("");

await mkdir(target, { recursive: true });
for (const name of ["anton-400", "dm-sans-400", "dm-sans-600"]) {
  const input = path.join(source, `${name}.woff2`);
  const output = path.join(target, `${name}-latin.woff2`);
  await writeFile(output, await subsetFont(await readFile(input), text, { targetFormat: "woff2" }));
  console.log(`${name}: ${(await stat(input)).size} -> ${(await stat(output)).size} bytes`);
}
