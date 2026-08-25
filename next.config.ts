import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Machine-readable markdown twins: /tool/x.md and /category/x.md serve the
  // prerendered tool-md / category-md route handlers
  async rewrites() {
    return [
      { source: "/tool/:slug.md", destination: "/tool-md/:slug" },
      { source: "/category/:slug.md", destination: "/category-md/:slug" },
    ];
  },
};

export default nextConfig;
