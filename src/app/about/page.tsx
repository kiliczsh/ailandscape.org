import type { Metadata } from "next";
import { getLandscapeData } from "@/data/landscape";
import type { CategoryGroup } from "@/types/landscape";
import { TechnicalAbout } from "./variants/technical";

export const metadata: Metadata = {
  title: "About — AI Landscape",
  description:
    "AI Landscape is an open source, community-maintained directory of every significant AI tool, framework, model, and service — organized by category and freely browsable.",
  alternates: { canonical: "https://ailandscape.org/about" },
};

export default function AboutPage() {
  const data = getLandscapeData();
  const categories = data.landscape;

  const totalItems = categories.flatMap((c) =>
    c.subcategories.flatMap((s) => s.items),
  ).length;
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce(
    (sum, c) => sum + c.subcategories.length,
    0,
  );
  const openSourceItems = categories.flatMap((c) =>
    c.subcategories.flatMap((s) => s.items.filter((i) => i.repo_url)),
  ).length;

  const groupCounts: Partial<Record<CategoryGroup, number>> = {};
  for (const cat of categories) {
    if (cat.group) {
      groupCounts[cat.group] = (groupCounts[cat.group] ?? 0) + 1;
    }
  }

  return (
    <TechnicalAbout
      stats={{
        totalItems,
        totalCategories,
        totalSubcategories,
        openSourceItems,
        groupCounts,
      }}
    />
  );
}
