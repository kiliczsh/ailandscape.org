export interface LandscapeItem {
  name: string;
  homepage_url?: string;
  repo_url?: string;
  logo?: string;
  crunchbase?: string;
  twitter_url?: string;
  project?: string;
  description?: string;
  tags?: string[];
}

export interface Subcategory {
  name: string;
  row: number;
  items: LandscapeItem[];
}

export type CategoryGroup =
  | "core-ai"
  | "infrastructure"
  | "engineering"
  | "products"
  | "governance"
  | "ecosystem";

export interface Category {
  name: string;
  group?: CategoryGroup;
  color?: string;
  icon?: string;
  subcategories: Subcategory[];
}

export interface TagMeta {
  label: string;
  color?: string;
}

export type TagsMap = Record<string, TagMeta>;

export interface LandscapeData {
  landscape: Category[];
  tags: TagsMap;
}
