import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Update this date whenever categories.yaml or significant content changes.
const LAST_MODIFIED = new Date("2026-03-30");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://ailandscape.org",
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
