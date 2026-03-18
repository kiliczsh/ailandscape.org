import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { Category, LandscapeData, TagsMap } from "@/types/landscape";

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
