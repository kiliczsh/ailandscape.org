import type { MetadataRoute } from "next";
import {
  getItemsByTag,
  getLandscapeData,
  getTagsWithItems,
  MIN_INDEXABLE_TAG_ITEMS,
} from "@/data/landscape";
import { toSlug } from "@/lib/slug";

export const dynamic = "force-static";

const BASE_URL = "https://ailandscape.org";

// lastModified is intentionally omitted when we don't know the real date —
// a fake build-time lastmod on every URL teaches crawlers to ignore it.
export default function sitemap(): MetadataRoute.Sitemap {
  const data = getLandscapeData();

  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/zh`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/submit`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  for (const category of data.landscape) {
    entries.push({
      url: `${BASE_URL}/category/${toSlug(category.name)}`,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const category of data.landscape) {
    entries.push({
      url: `${BASE_URL}/zh/category/${toSlug(category.name)}`,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const tag of getTagsWithItems(data)) {
    // Thin tag pages are noindexed — keep them out of the sitemap too
    if (getItemsByTag(data, tag).length < MIN_INDEXABLE_TAG_ITEMS) continue;
    entries.push({
      url: `${BASE_URL}/tag/${tag}`,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const category of data.landscape) {
    for (const subcategory of category.subcategories) {
      for (const item of subcategory.items) {
        entries.push({
          url: `${BASE_URL}/tool/${toSlug(item.name)}`,
          ...(item.added_at ? { lastModified: new Date(item.added_at) } : {}),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  }

  return entries;
}
