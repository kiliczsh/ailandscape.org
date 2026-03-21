"use client";

import {
  ArrowsLeftRight,
  Brain,
  Buildings,
  CaretDown,
  ChartLine,
  ChatText,
  Code,
  Cube,
  Database,
  GitBranch,
  Graph,
  HardDrives,
  Image,
  Intersect,
  MagnifyingGlass,
  Medal,
  Plug,
  Robot,
  Shapes,
  ShareNetwork,
  ShieldCheck,
  Waveform,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useLandscapeFilter } from "@/contexts/landscape-filter-context";
import type { Category } from "@/types/landscape";
import { SubcategorySection } from "./subcategory-section";

// Values mirrored in globals.css as --category-default-color / --category-dark-endpoint
const DEFAULT_COLOR = "var(--category-default-color)";
const DARK_ENDPOINT = "var(--category-dark-endpoint)";

type PhosphorIcon = React.ComponentType<{
  size?: number;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}>;

const ICONS: Record<string, PhosphorIcon> = {
  ArrowsLeftRight,
  Brain,
  Buildings,
  ChartLine,
  ChatText,
  Code,
  Cube,
  Database,
  GitBranch,
  Graph,
  HardDrives,
  Image,
  Intersect,
  MagnifyingGlass,
  Plug,
  Robot,
  ShieldCheck,
  Waveform,
};

interface ToggleBarContentProps {
  caretClass: string;
  name: string;
  iconComponent: PhosphorIcon;
  totalItemCount?: number;
  filteredItemCount?: number;
}

function ToggleBarContent({
  caretClass,
  name,
  iconComponent: Icon,
  totalItemCount,
  filteredItemCount,
}: ToggleBarContentProps) {
  const showCount =
    totalItemCount !== undefined && filteredItemCount !== undefined;
  const countText =
    showCount && filteredItemCount !== totalItemCount
      ? `${filteredItemCount} / ${totalItemCount}`
      : showCount
        ? `${totalItemCount}`
        : undefined;

  return (
    <>
      <CaretDown
        size={11}
        weight="bold"
        aria-hidden="true"
        className={`shrink-0 text-white/80 transition-transform duration-200 ${caretClass}`}
      />
      <Icon size={13} aria-hidden="true" className="shrink-0 text-white/80" />
      <span className="min-w-0 truncate text-sm font-bold tracking-wide text-white">
        {name}
      </span>
      {countText && (
        <span className="ml-auto shrink-0 text-[10px] tabular-nums text-white/80">
          {countText}
        </span>
      )}
    </>
  );
}

interface CategoryRowProps {
  category: Category;
  viewMode?: "grid" | "card";
  style?: React.CSSProperties;
  totalItemCount: number;
  filteredItemCount: number;
  isFirstCategory?: boolean;
}

export function CategoryRow({
  category,
  viewMode = "grid",
  isFirstCategory = false,
  style,
  totalItemCount,
  filteredItemCount,
}: CategoryRowProps) {
  const [collapsed, setCollapsed] = useState(false);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const baseColor = category.color ?? DEFAULT_COLOR;
  const slug = category.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const { onTierListOpen } = useLandscapeFilter();

  const allItems = useMemo(
    () => category.subcategories.flatMap((sub) => sub.items),
    [category.subcategories],
  );

  const handleShareCategory = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const url = new URL(window.location.href);
      // Clean existing params, keep only essentials
      const params = new URLSearchParams();
      params.set("category", slug);
      params.set("utm_source", "ailandscape");
      params.set("utm_medium", "share");
      params.set("utm_campaign", "category");
      url.search = params.toString();
      navigator.clipboard.writeText(url.toString());
      toast.success("Link copied!");
    },
    [slug],
  );

  const handleTierListClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onTierListOpen(
        category.name,
        { name: category.name, items: allItems },
        baseColor,
      );
    },
    [category.name, allItems, baseColor, onTierListOpen],
  );

  useEffect(() => {
    if (collapsed) {
      expandButtonRef.current?.focus();
    }
  }, [collapsed]);

  const sidebarColor = `color-mix(in oklch, ${baseColor} 70%, ${DARK_ENDPOINT})`;

  const IconComponent = category.icon
    ? (ICONS[category.icon] ?? Shapes)
    : Shapes;
  const sectionId = `category-${slug}`;
  const contentId = `category-${slug}-content`;
  const headingId = `category-${slug}-heading`;

  return (
    <section
      id={sectionId}
      aria-labelledby={headingId}
      className="flex flex-col border-b border-border last:border-b-0"
      style={style}
    >
      <h2 id={headingId} className="sr-only">
        {category.name}
      </h2>
      {/* Mobile: always-visible horizontal toggle */}
      <div
        className="flex w-full items-center gap-2 px-3 py-2.5 sm:hidden"
        style={{ backgroundColor: sidebarColor }}
      >
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex flex-1 items-center gap-2 min-w-0"
          aria-expanded={!collapsed}
          aria-controls={contentId}
          aria-label={
            collapsed ? `Expand ${category.name}` : `Collapse ${category.name}`
          }
        >
          <ToggleBarContent
            caretClass={collapsed ? "-rotate-90" : ""}
            name={category.name}
            iconComponent={IconComponent}
            totalItemCount={totalItemCount}
            filteredItemCount={filteredItemCount}
          />
        </button>
        <button
          type="button"
          onClick={handleShareCategory}
          title={`Share ${category.name}`}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-white/60 hover:text-white hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ShareNetwork size={13} />
        </button>
        <button
          type="button"
          onClick={handleTierListClick}
          title={`Tier List — ${category.name}`}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-white/60 hover:text-white hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Medal size={13} />
        </button>
      </div>

      {/* Desktop: horizontal bar — only when collapsed */}
      {collapsed && (
        <div
          className="hidden w-full items-center gap-2 px-3 py-2.5 sm:flex"
          style={{ backgroundColor: sidebarColor }}
        >
          <button
            ref={expandButtonRef}
            type="button"
            onClick={() => setCollapsed(false)}
            className="flex flex-1 items-center gap-2 min-w-0"
            aria-expanded={false}
            aria-controls={contentId}
            aria-label={`Expand ${category.name}`}
          >
            <ToggleBarContent
              caretClass="-rotate-90"
              name={category.name}
              iconComponent={IconComponent}
              totalItemCount={totalItemCount}
              filteredItemCount={filteredItemCount}
            />
          </button>
          <button
            type="button"
            onClick={handleShareCategory}
            title={`Share ${category.name}`}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-white/60 hover:text-white hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ShareNetwork size={13} />
          </button>
          <button
            type="button"
            onClick={handleTierListClick}
            title={`Tier List — ${category.name}`}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-white/60 hover:text-amber-200 hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Medal size={13} />
          </button>
        </div>
      )}

      {/* Collapsible content — CSS grid trick, no layout shift */}
      <div
        id={contentId}
        inert={collapsed}
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            {/* Desktop: vertical sidebar — click to collapse */}
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="hidden min-w-[44px] shrink-0 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden py-3 sm:flex"
              style={{ backgroundColor: sidebarColor }}
              aria-expanded={!collapsed}
              aria-controls={contentId}
              aria-label={`Collapse ${category.name}`}
            >
              <span
                className="text-sm font-bold tracking-wide text-white"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              >
                {category.name}
              </span>
              <span className="mt-1 text-[10px] tabular-nums text-white/80">
                {filteredItemCount !== totalItemCount
                  ? `${filteredItemCount} / ${totalItemCount}`
                  : `${totalItemCount}`}
              </span>
            </button>
            <div className="flex flex-1 flex-wrap">
              {category.subcategories.map((sub, subIndex) => (
                <SubcategorySection
                  key={`${category.name}-${sub.name}`}
                  subcategory={sub}
                  categoryName={category.name}
                  subheaderColor={baseColor}
                  categoryColor={baseColor}
                  viewMode={viewMode}
                  isFirstSubcategory={isFirstCategory && subIndex === 0}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
