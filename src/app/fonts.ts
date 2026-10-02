import localFont from "next/font/local";

/*
 * Fonts load straight from the asset pack (ASSET_ROOT). next/font requires literal relative paths.
 * Only the weights the UI uses are declared: Anton 400 (display) and DM Sans 400/600 (body/UI).
 * Licences: 212-chicken-assets/212-chicken-assets/fonts/anton-OFL.txt and dmsans-OFL.txt.
 */
export const anton = localFont({
  src: "../../212-chicken-assets/212-chicken-assets/fonts/anton-400.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-anton",
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
});

export const dmSans = localFont({
  src: [
    { path: "../../212-chicken-assets/212-chicken-assets/fonts/dm-sans-400.woff2", weight: "400", style: "normal" },
    { path: "../../212-chicken-assets/212-chicken-assets/fonts/dm-sans-600.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--font-dm-sans",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});
