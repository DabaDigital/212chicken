import localFont from "next/font/local";

/*
 * Latin subsets of the original asset pack (85 KB → 49 KB); regenerate with `node scripts/subset-fonts.mjs`.
 * Only the weights the UI uses are declared: Anton 400 (display) and DM Sans 400/600 (body/UI).
 * Licences: 212-chicken-assets/212-chicken-assets/fonts/anton-OFL.txt and dmsans-OFL.txt.
 */
export const anton = localFont({
  src: "./font-assets/anton-400-latin.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-anton",
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
});

export const dmSans = localFont({
  src: [
    { path: "./font-assets/dm-sans-400-latin.woff2", weight: "400", style: "normal" },
    { path: "./font-assets/dm-sans-600-latin.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--font-dm-sans",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});
