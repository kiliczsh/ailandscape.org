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
  Plug,
  Robot,
  Rows,
  Shapes,
  ShieldCheck,
  Waveform,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import type { Category } from "@/types/landscape";
import { SubcategorySection } from "./subcategory-section";
import { TierListPanel } from "./tier-list-panel";

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
  const [tierListOpen, setTierListOpen] = useState(false);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const baseColor = category.color ?? DEFAULT_COLOR;

  useEffect(() => {
    if (collapsed) {
      expandButtonRef.current?.focus();
    }
  }, [collapsed]);

  const sidebarColor = `color-mix(in oklch, ${baseColor} 70%, ${DARK_ENDPOINT})`;

  const IconComponent = category.icon
    ? (ICONS[category.icon] ?? Shapes)
    : Shapes;
  const slug = category.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const sectionId = `category-${slug}`;
  const contentId = `category-${slug}-content`;
  const headingId = `category-${slug}-heading`;
  const tierListId = `category-${slug}-tierlist`;

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
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center gap-2 px-3 py-2.5 sm:hidden"
        style={{ backgroundColor: sidebarColor }}
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

      {/* Desktop: horizontal bar — only when collapsed */}
      {collapsed && (
        <button
          ref={expandButtonRef}
          type="button"
          onClick={() => setCollapsed(false)}
          className="hidden w-full items-center gap-2 px-3 py-2.5 sm:flex"
          style={{ backgroundColor: sidebarColor }}
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
            {/* Desktop: vertical sidebar — click to collapse + tier list toggle */}
            <div
              className="hidden min-w-[44px] shrink-0 sm:flex flex-col items-center justify-between overflow-hidden py-3"
              style={{ backgroundColor: sidebarColor }}
            >
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="flex flex-1 w-full cursor-pointer flex-col items-center justify-center gap-2"
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
              <button
                type="button"
                onClick={() => setTierListOpen((o) => !o)}
                aria-expanded={tierListOpen}
                aria-controls={tierListId}
                aria-label={
                  tierListOpen
                    ? `Close tier list for ${category.name}`
                    : `Open tier list for ${category.name}`
                }
                title="Tier List"
                className="mt-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  backgroundColor: tierListOpen
                    ? "rgba(255,255,255,0.25)"
                    : "transparent",
                  color: "#fff",
                }}
              >
                <Rows size={14} aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-1 flex-col">
              <div className="flex flex-wrap">
                {category.subcategories.map((sub, subIndex) => (
                  <SubcategorySection
                    key={`${category.name}-${sub.name}`}
                    subcategory={sub}
                    subheaderColor={baseColor}
                    categoryColor={baseColor}
                    viewMode={viewMode}
                    isFirstSubcategory={isFirstCategory && subIndex === 0}
                  />
                ))}
              </div>
              {/* Mobile: tier list toggle */}
              <button
                type="button"
                onClick={() => setTierListOpen((o) => !o)}
                aria-expanded={tierListOpen}
                aria-controls={tierListId}
                className="flex sm:hidden w-full items-center gap-2 px-3 py-2 border-t border-border text-xs text-muted-foreground hover:bg-accent/40 transition-colors"
              >
                <Rows size={12} aria-hidden="true" />
                <span>
                  {tierListOpen ? "Close Tier List" : "Open Tier List"}
                </span>
              </button>
              {/* Tier list panel — animated open/close */}
              <div
                id={tierListId}
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                  tierListOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <TierListPanel
                    categoryName={category.name}
                    subcategories={category.subcategories}
                    onClose={() => setTierListOpen(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
