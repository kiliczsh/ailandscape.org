"use client";

import type { Subcategory } from "@/types/landscape";
import { ItemAvatar } from "./item-card";

const MAX_PREVIEW = 12;

interface SubcategoryCardProps {
  subcategory: Subcategory;
  categoryColor: string;
  isSelected: boolean;
  onClick: () => void;
}

export function SubcategoryCard({
  subcategory,
  categoryColor,
  isSelected,
  onClick,
}: SubcategoryCardProps) {
  const preview = subcategory.items.slice(0, MAX_PREVIEW);
  const remaining = subcategory.items.length - preview.length;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`${subcategory.name} — ${subcategory.items.length} tools`}
      className="flex flex-col gap-2.5 rounded-xl border-2 p-3 text-left cursor-pointer transition-all duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      style={{
        borderColor: categoryColor,
        backgroundColor: isSelected
          ? `${categoryColor}28`
          : `${categoryColor}0f`,
        boxShadow: isSelected
          ? `0 0 0 1px ${categoryColor}88, 0 4px 20px -4px ${categoryColor}55`
          : undefined,
      }}
    >
      {/* Subcategory name */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold leading-tight text-foreground">
          {subcategory.name}
        </span>
        <span
          className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white"
          style={{ backgroundColor: categoryColor }}
        >
          {subcategory.items.length}
        </span>
      </div>

      {/* Logo + name grid */}
      <div className="flex flex-wrap gap-2">
        {preview.map((item) => (
          <div
            key={item.name}
            className="flex w-20 flex-col items-center gap-1.5"
          >
            <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-background/80">
              <ItemAvatar
                name={item.name}
                logo={item.logo}
                containerClass="h-full w-full rounded-xl"
              />
            </div>
            <span className="w-full break-words text-center text-xs leading-tight text-foreground/80 line-clamp-2">
              {item.name}
            </span>
          </div>
        ))}
        {remaining > 0 && (
          <div className="flex w-20 flex-col items-center gap-1.5">
            <div
              className="flex h-[72px] w-[72px] items-center justify-center rounded-xl border border-white/10 text-sm font-bold"
              style={{
                backgroundColor: `${categoryColor}33`,
                color: categoryColor,
              }}
            >
              +{remaining}
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
