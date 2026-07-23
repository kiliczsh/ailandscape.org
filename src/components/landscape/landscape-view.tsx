"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { LandscapeFilterProvider } from "@/contexts/landscape-filter-context";
import { useLandscapeParams } from "@/hooks/use-landscape-params";
import { trackEvent } from "@/lib/analytics";
import type { LandscapeData, Subcategory } from "@/types/landscape";
import { CategoryRow } from "./category-row";
import { CommandPalette } from "./command-palette";
import { FilterBar } from "./filter-bar";
import { TierListModal } from "./tier-list-modal";

interface LandscapeViewProps {
  data: LandscapeData;
}

export function LandscapeView({ data }: LandscapeViewProps) {
  const {
    query,
    groupFilter,
    viewMode: urlViewMode,
    activeTag,
    activeCategory,
    setQuery,
    setGroupFilter,
    setViewMode,
    setActiveTag,
    setActiveCategory,
  } = useLandscapeParams();

  const viewMode = urlViewMode;
  const lowerQuery = query.trim().toLowerCase();

  const filteredData = useMemo(() => {
    const categories = data.landscape
      .filter((category) => {
        if (groupFilter === "all") return true;
        return category.group === groupFilter;
      })
      .map((category) => {
        if (!lowerQuery && !activeTag) return category;
        const filteredSubs = category.subcategories
          .map((sub) => {
            const filteredItems = sub.items.filter((item) => {
              const matchesQuery =
                !lowerQuery || item.name.toLowerCase().includes(lowerQuery);
              const matchesTag =
                !activeTag || (item.tags ?? []).includes(activeTag);
              return matchesQuery && matchesTag;
            });
            return { ...sub, items: filteredItems };
          })
          .filter((sub) => sub.items.length > 0);
        return { ...category, subcategories: filteredSubs };
      })
      .filter((category) => category.subcategories.length > 0);

    return { ...data, landscape: categories };
  }, [data, groupFilter, lowerQuery, activeTag]);

  const totalItems = useMemo(
    () =>
      data.landscape.reduce(
        (sum, cat) =>
          sum + cat.subcategories.reduce((s, sub) => s + sub.items.length, 0),
        0,
      ),
    [data],
  );

  const visibleItems = useMemo(
    () =>
      filteredData.landscape.reduce(
        (sum, cat) =>
          sum + cat.subcategories.reduce((s, sub) => s + sub.items.length, 0),
        0,
      ),
    [filteredData],
  );

  const categoryTotalCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of data.landscape) {
      counts[cat.name] = cat.subcategories.reduce(
        (s, sub) => s + sub.items.length,
        0,
      );
    }
    return counts;
  }, [data]);

  const categoryFilteredCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of filteredData.landscape) {
      counts[cat.name] = cat.subcategories.reduce(
        (s, sub) => s + sub.items.length,
        0,
      );
    }
    return counts;
  }, [filteredData]);

  const [forceCollapse, setForceCollapse] = useState<boolean | null>(null);
  const allCollapsed = forceCollapse === true;

  const [tierListData, setTierListData] = useState<{
    categoryName: string;
    subcategory: Subcategory;
    categoryColor?: string;
  } | null>(null);

  const contextValue = useMemo(
    () => ({
      query,
      activeTag,
      tags: data.tags,
      onTagClick: (tag: string) => {
        if (activeTag !== tag) trackEvent("tag_filter_applied", { tag });
        setActiveTag(activeTag === tag ? "" : tag);
      },
      onTierListOpen: (
        categoryName: string,
        subcategory: Subcategory,
        categoryColor?: string,
      ) => {
        setTierListData({ categoryName, subcategory, categoryColor });
      },
    }),
    [query, activeTag, data.tags, setActiveTag],
  );

  // Track search_query after debounce settle (URL already debounced ~150ms)
  const lastTrackedQueryRef = useRef("");
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 2) return;
    if (trimmed === lastTrackedQueryRef.current) return;
    lastTrackedQueryRef.current = trimmed;
    trackEvent("search_query", {
      query: trimmed,
      result_count: visibleItems,
    });
  }, [query, visibleItems]);

  // Auto-scroll to category when ?category= param is present
  useEffect(() => {
    if (!activeCategory) return;
    const slug = activeCategory
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const el = document.getElementById(`category-${slug}`);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      setActiveCategory("");
    }
  }, [activeCategory, setActiveCategory]);

  const everShownRef = useRef(new Set<string>());
  useEffect(() => {
    for (const cat of filteredData.landscape) {
      everShownRef.current.add(cat.name);
    }
  }, [filteredData.landscape]);

  return (
    <LandscapeFilterProvider value={contextValue}>
      <CommandPalette data={data} />
      {tierListData && (
        <TierListModal
          open={!!tierListData}
          onOpenChange={(open) => {
            if (!open) setTierListData(null);
          }}
          categoryName={tierListData.categoryName}
          subcategory={tierListData.subcategory}
          categoryColor={tierListData.categoryColor}
        />
      )}
      <div className="flex flex-col flex-1">
        <FilterBar
          query={query}
          groupFilter={groupFilter}
          viewMode={viewMode}
          activeTag={activeTag}
          totalItems={totalItems}
          totalCategories={data.landscape.length}
          visibleItems={visibleItems}
          visibleCategories={filteredData.landscape.length}
          onGroupChange={(g) => {
            if (g !== groupFilter)
              trackEvent("group_filter_applied", { group: g });
            setGroupFilter(g);
          }}
          allCollapsed={allCollapsed}
          onViewChange={setViewMode}
          onTagClear={() => setActiveTag("")}
          onCollapseToggle={() =>
            setForceCollapse((prev) => {
              const next = prev !== true;
              if (next) window.scrollTo({ top: 0, behavior: "smooth" });
              return next;
            })
          }
        />
        <output aria-atomic="true" className="sr-only">
          {visibleItems === 0
            ? "No items match the current filters."
            : `Showing ${visibleItems} of ${totalItems} tools.`}
        </output>
        <div className="flex-1 overflow-x-auto">
          {filteredData.landscape.length === 0 ? (
            <Empty className="border-0 py-20">
              <EmptyHeader>
                <EmptyTitle className="text-muted-foreground font-normal">
                  No items match this filter.
                </EmptyTitle>
              </EmptyHeader>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => {
                  setGroupFilter("all");
                  setQuery("");
                  setActiveTag("");
                }}
              >
                Clear filters
              </Button>
            </Empty>
          ) : (
            <div className="min-w-0">
              {filteredData.landscape.map((category, index) => {
                const isFirstAppearance = !everShownRef.current.has(
                  category.name,
                );
                return (
                  <CategoryRow
                    key={category.name}
                    category={category}
                    viewMode={viewMode}
                    isFirstCategory={index === 0}
                    forceCollapse={forceCollapse}
                    totalItemCount={categoryTotalCounts[category.name] ?? 0}
                    filteredItemCount={
                      categoryFilteredCounts[category.name] ?? 0
                    }
                    style={
                      isFirstAppearance
                        ? {
                            animation:
                              "fade-in-up 450ms cubic-bezier(0.25, 1, 0.5, 1) both",
                            animationDelay: `${Math.min(index * 30, 150)}ms`,
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </LandscapeFilterProvider>
  );
}
