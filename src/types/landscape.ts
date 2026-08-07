export type EntityType =
  | "company"
  | "lab"
  | "model_family"
  | "product"
  | "framework"
  | "protocol"
  | "benchmark"
  | "dataset"
  | "hardware"
  | "standard";

export type AccessType = "open_source" | "open_weights" | "proprietary";

export type EntityStatus =
  | "active"
  | "maintenance"
  | "archived"
  | "acquired"
  | "rebranded";

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
  entity_type?: EntityType;
  access?: AccessType;
  status?: EntityStatus;
  aliases?: string[];
  added_at?: string;
  last_verified_at?: string;
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
  | "coding"
  | "applications"
  | "governance";

export interface Category {
  name: string;
  group?: CategoryGroup;
  color?: string;
  icon?: string;
  intro?: string;
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
