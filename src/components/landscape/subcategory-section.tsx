"use client";

import { Rows } from "@phosphor-icons/react";
import { useLandscapeFilter } from "@/contexts/landscape-filter-context";
import type { Subcategory } from "@/types/landscape";
import { ItemCard } from "./item-card";

interface SubcategorySectionProps {
  subcategory: Subcategory;
  categoryName: string;
  subheaderColor?: string;
  categoryColor?: string;
  viewMode?: "grid" | "card";
  isFirstSubcategory?: boolean;
}

// Choose white or near-black text based on OKLCH lightness (L > 0.5 = light bg).
// When the color is a CSS var() reference (no OKLCH literal), the regex won't match —
// fall back to white: the default category color is oklch(0.4 ...) which is dark,
// so white text is correct. Dark text on a dark background would fail contrast.
function getTextClass(subheaderColor?: string): string {
  if (!subheaderColor) return "text-white";
  const m = subheaderColor.match(/oklch\(\s*([\d.]+)/);
  if (!m) return "text-white";
  return parseFloat(m[1]) > 0.5
    ? "text-category-header-text-dark"
    : "text-white";
}

export function SubcategorySection({
  subcategory,
  categoryName,
  subheaderColor,
  categoryColor,
  viewMode = "grid",
  isFirstSubcategory = false,
}: SubcategorySectionProps) {
  const textClass = getTextClass(subheaderColor);
  const { onTierListOpen } = useLandscapeFilter();

  return (
    <section className="flex w-full flex-col border-b border-border last:border-b-0 sm:min-w-[192px] sm:w-auto sm:flex-1 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <button
        type="button"
        onClick={() => onTierListOpen(categoryName, subcategory, categoryColor)}
        title={`${subcategory.name} — Tier List`}
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:brightness-110 transition-[filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${textClass}`}
        style={subheaderColor ? { backgroundColor: subheaderColor } : undefined}
      >
        <h3
          className="min-w-0 truncate text-sm font-semibold flex-1 text-left"
          title={subcategory.name}
        >
          {subcategory.name}
        </h3>
        <Rows size={12} className="shrink-0 opacity-50" />
      </button>
      <div
        className={
          viewMode === "card"
            ? "flex flex-col gap-1 p-2"
            : "flex flex-wrap gap-2 p-3"
        }
      >
        {subcategory.items.map((item, index) => (
          <ItemCard
            key={`${subcategory.name}-${item.name}`}
            item={item}
            viewMode={viewMode}
            categoryColor={categoryColor}
            priority={isFirstSubcategory || index < 4}
          />
        ))}
      </div>
    </section>
  );
}
