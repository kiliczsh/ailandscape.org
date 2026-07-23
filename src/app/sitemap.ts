import type { MetadataRoute } from "next";
import { getLandscapeData, getTagsWithItems } from "@/data/landscape";
import { toSlug } from "@/lib/slug";

export const dynamic = "force-static";

const BASE_URL = "https://ailandscape.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const data = getLandscapeData();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/submit`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  for (const category of data.landscape) {
    entries.push({
      url: `${BASE_URL}/category/${toSlug(category.name)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const tag of getTagsWithItems(data)) {
    entries.push({
      url: `${BASE_URL}/tag/${tag}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const category of data.landscape) {
    for (const subcategory of category.subcategories) {
      for (const item of subcategory.items) {
        const lastModified = item.added_at ? new Date(item.added_at) : now;
        entries.push({
          url: `${BASE_URL}/tool/${toSlug(item.name)}`,
          lastModified,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  }

  return entries;
}
