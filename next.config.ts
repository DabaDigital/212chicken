import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Small route styles ship with the HTML instead of blocking first paint on another request.
  experimental: { inlineCss: true },
  images: {
    // Runtime asset copies and owner-supplied social video covers.
    localPatterns: [
      { pathname: "/212/**", search: "" },
      { pathname: "/social/**", search: "" },
      { pathname: "/locations/**", search: "" },
    ],
    // 75 for product photos (default); 65 only for the large campaign burger frames.
    qualities: [65, 75],
    // AVIF first (≈40% lighter than WebP on these alpha cut-outs), WebP for older browsers.
    formats: ["image/avif", "image/webp"],
    // Product cards never exceed ~460 CSS px; hero art never exceeds ~900 CSS px.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/212/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
