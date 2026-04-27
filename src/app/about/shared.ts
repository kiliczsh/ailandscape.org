import type { CategoryGroup } from "@/types/landscape";

export interface AboutStats {
  totalItems: number;
  totalCategories: number;
  totalSubcategories: number;
  openSourceItems: number;
  groupCounts: Partial<Record<CategoryGroup, number>>;
}

export const GROUP_META: Record<
  CategoryGroup,
  { label: string; color: string }
> = {
  "core-ai": { label: "Core AI", color: "var(--group-core-ai)" },
  infrastructure: {
    label: "Infrastructure",
    color: "var(--group-infrastructure)",
  },
  engineering: { label: "Engineering", color: "var(--group-engineering)" },
  products: { label: "Products", color: "var(--group-products)" },
  governance: { label: "Governance", color: "var(--group-governance)" },
  ecosystem: { label: "Ecosystem", color: "var(--group-ecosystem)" },
};
