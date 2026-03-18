export interface LandscapeItem {
  name: string;
  homepage_url?: string;
  repo_url?: string;
  logo?: string;
  description?: string;
  crunchbase?: string;
  tags?: string[];
}

export interface Subcategory {
  name: string;
  items: LandscapeItem[];
}

export type CategoryGroup =
  | "labs"
  | "models"
  | "infrastructure"
  | "protocols"
  | "security"
  | "product";

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
