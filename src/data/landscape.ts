import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { toSlug } from "@/lib/slug";
import type {
  Category,
  LandscapeData,
  LandscapeItem,
  Subcategory,
  TagsMap,
} from "@/types/landscape";

export interface FoundItem {
  item: LandscapeItem;
  category: Category;
  subcategory: Subcategory;
}

export function findCategoryBySlug(
  data: LandscapeData,
  slug: string,
): Category | null {
  for (const category of data.landscape) {
    if (toSlug(category.name) === slug) return category;
  }
  return null;
}

export function getRecentlyAdded(data: LandscapeData, limit = 6): FoundItem[] {
  const items: FoundItem[] = [];
  for (const category of data.landscape) {
    for (const subcategory of category.subcategories) {
      for (const item of subcategory.items) {
        if (item.added_at) items.push({ item, category, subcategory });
      }
    }
  }
  return items
    .sort((a, b) =>
      (b.item.added_at ?? "").localeCompare(a.item.added_at ?? ""),
    )
    .slice(0, limit);
}

export function findItemBySlug(
  data: LandscapeData,
  slug: string,
): FoundItem | null {
  for (const category of data.landscape) {
    for (const subcategory of category.subcategories) {
      for (const item of subcategory.items) {
        if (toSlug(item.name) === slug) {
          return { item, category, subcategory };
        }
      }
    }
  }
  return null;
}

export function getRelatedItems(
  data: LandscapeData,
  currentName: string,
  subcategoryName: string,
  limit = 8,
): LandscapeItem[] {
  for (const category of data.landscape) {
    for (const subcategory of category.subcategories) {
      if (subcategory.name === subcategoryName) {
        return subcategory.items
          .filter((i) => i.name !== currentName)
          .slice(0, limit);
      }
    }
  }
  return [];
}

export function getItemsByTag(data: LandscapeData, tag: string): FoundItem[] {
  const items: FoundItem[] = [];
  for (const category of data.landscape) {
    for (const subcategory of category.subcategories) {
      for (const item of subcategory.items) {
        if (item.tags?.includes(tag))
          items.push({ item, category, subcategory });
      }
    }
  }
  return items;
}

export function getTagsWithItems(data: LandscapeData): string[] {
  const used = new Set<string>();
  for (const category of data.landscape) {
    for (const subcategory of category.subcategories) {
      for (const item of subcategory.items) {
        for (const tag of item.tags ?? []) used.add(tag);
      }
    }
  }
  return Object.keys(data.tags)
    .filter((tag) => used.has(tag))
    .sort();
}

// Cache parsed YAML across calls in production builds only —
// in dev, re-reading keeps YAML edits visible without a restart.
let cachedData: LandscapeData | null = null;

export function getLandscapeData(): LandscapeData {
  if (cachedData && process.env.NODE_ENV === "production") return cachedData;
  const dir = join(process.cwd(), "src/data/categories");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".yaml"))
    .sort();

  const landscape: Category[] = files.map((file) => {
    const filePath = join(dir, file);
    let raw: string;
    try {
      raw = readFileSync(filePath, "utf8");
    } catch (err) {
      throw new Error(`Failed to read category file "${file}": ${err}`);
    }
    try {
      return parse(raw) as Category;
    } catch (err) {
      throw new Error(`Invalid YAML in "${file}": ${err}`);
    }
  });

  const tagsPath = join(process.cwd(), "src/data/tags.yaml");
  let tags: TagsMap = {};
  try {
    tags = parse(readFileSync(tagsPath, "utf8")) as TagsMap;
  } catch (err) {
    throw new Error(`Failed to load tags.yaml: ${err}`);
  }

  cachedData = { landscape, tags };
  return cachedData;
}
