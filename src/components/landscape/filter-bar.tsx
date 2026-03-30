"use client";

import {
  ArrowsIn,
  ArrowsOut,
  Cards,
  SquaresFour,
  Tag,
  X,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CategoryGroup } from "@/types/landscape";

type GroupFilter = "all" | CategoryGroup;
type ViewMode = "grid" | "card";

const FILTER_OPTIONS: [GroupFilter, string][] = [
  ["all", "All"],
  ["core-ai", "Core AI"],
  ["infrastructure", "Infrastructure"],
  ["engineering", "Engineering"],
  ["products", "Products"],
  ["governance", "Governance"],
  ["ecosystem", "Ecosystem"],
];

const GROUP_ACTIVE_COLORS: Partial<Record<GroupFilter, string>> = {
  "core-ai": "var(--group-core-ai)",
  infrastructure: "var(--group-infrastructure)",
  engineering: "var(--group-engineering)",
  products: "var(--group-products)",
  governance: "var(--group-governance)",
  ecosystem: "var(--group-ecosystem)",
};

interface FilterBarProps {
  query: string;
  groupFilter: GroupFilter;
  viewMode: ViewMode;
  activeTag: string;
  totalItems: number;
  totalCategories: number;
  visibleItems: number;
  visibleCategories: number;
  allCollapsed: boolean;
  onGroupChange: (g: GroupFilter) => void;
  onViewChange: (v: ViewMode) => void;
  onTagClear: () => void;
  onCollapseToggle: () => void;
}

export function FilterBar({
  query,
  groupFilter,
  viewMode,
  activeTag,
  totalItems,
  totalCategories,
  visibleItems,
  visibleCategories: _visibleCategories,
  allCollapsed,
  onGroupChange,
  onViewChange,
  onTagClear,
  onCollapseToggle,
}: FilterBarProps) {
  const isFiltered = query !== "" || groupFilter !== "all" || activeTag !== "";

  const statsText = isFiltered
    ? `${visibleItems} / ${totalItems} tools`
    : `${totalItems} tools · ${totalCategories} categories`;

  return (
    <div className="border-b border-border px-4 py-2">
      {/* Single row: scrollable group pills (with fade) + tag chip + stats + view toggle */}
      <div className="flex items-center gap-2">
        {/* Mobile: native select dropdown */}
        <select
          aria-label="Filter by group"
          value={groupFilter}
          onChange={(e) => onGroupChange(e.target.value as GroupFilter)}
          className="sm:hidden h-9 rounded-md border border-input bg-transparent px-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {FILTER_OPTIONS.map(([f, label]) => (
            <option key={f} value={f}>
              {label}
            </option>
          ))}
        </select>

        {/* Desktop: pill radio buttons */}
        <div className="relative hidden sm:block shrink-0">
          <div
            role="radiogroup"
            aria-label="Filter by group"
            className="flex gap-1"
          >
            {FILTER_OPTIONS.map(([f, label]) => {
              const isActive = groupFilter === f;
              const groupColor =
                isActive && f !== "all" ? GROUP_ACTIVE_COLORS[f] : undefined;
              return (
                <label
                  key={f}
                  className={cn(
                    buttonVariants({
                      variant: isActive ? "default" : "outline",
                      size: "sm",
                    }),
                    "h-7 shrink-0 cursor-pointer px-2.5 focus-within:ring-2 focus-within:ring-ring/30",
                  )}
                  style={
                    groupColor
                      ? { backgroundColor: groupColor, borderColor: groupColor }
                      : undefined
                  }
                >
                  <input
                    type="radio"
                    name="group-filter"
                    value={f}
                    checked={groupFilter === f}
                    onChange={() => onGroupChange(f)}
                    className="sr-only"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {activeTag && (
          <>
            <div className="h-4 w-px shrink-0 bg-border" />
            <div className="flex shrink-0 items-center gap-1">
              <Tag
                size={12}
                aria-hidden="true"
                className="text-muted-foreground"
              />
              <button
                type="button"
                onClick={onTagClear}
                aria-label={`Remove tag filter: ${activeTag}`}
                className="rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <Badge
                  variant="secondary"
                  className="pointer-events-none h-9 gap-1 px-2.5 text-xs sm:h-6 sm:px-2"
                >
                  {activeTag}
                  <X size={10} aria-hidden="true" />
                </Badge>
              </button>
            </div>
          </>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span className="hidden text-xs tabular-nums text-muted-foreground sm:inline">
            {statsText}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onCollapseToggle}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-11 w-11 sm:h-7 sm:w-7 p-0",
                )}
              >
                {allCollapsed ? (
                  <ArrowsOut size={13} aria-hidden="true" />
                ) : (
                  <ArrowsIn size={13} aria-hidden="true" />
                )}
                <span className="sr-only">
                  {allCollapsed ? "Expand all" : "Collapse all"}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {allCollapsed ? "Expand all" : "Collapse all"}
            </TooltipContent>
          </Tooltip>
          <div role="radiogroup" aria-label="View mode" className="flex gap-1">
            {(
              [
                {
                  mode: "grid" as ViewMode,
                  Icon: SquaresFour,
                  label: "Grid view",
                },
                { mode: "card" as ViewMode, Icon: Cards, label: "Card view" },
              ] as const
            ).map(({ mode, Icon, label }) => (
              <Tooltip key={mode}>
                <TooltipTrigger asChild>
                  <label
                    className={cn(
                      buttonVariants({
                        variant: viewMode === mode ? "default" : "outline",
                        size: "sm",
                      }),
                      "h-11 w-11 sm:h-7 sm:w-7 cursor-pointer p-0 focus-within:ring-2 focus-within:ring-ring/30",
                    )}
                  >
                    <input
                      type="radio"
                      name="view-mode"
                      value={mode}
                      checked={viewMode === mode}
                      onChange={() => onViewChange(mode)}
                      className="sr-only"
                    />
                    <Icon size={13} aria-hidden="true" />
                    <span className="sr-only">{label}</span>
                  </label>
                </TooltipTrigger>
                <TooltipContent side="bottom">{label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
