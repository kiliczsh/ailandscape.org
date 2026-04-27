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

export function getLandscapeData(): LandscapeData {
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

  return { landscape, tags };
}
