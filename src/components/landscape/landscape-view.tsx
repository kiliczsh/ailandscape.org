"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { LandscapeFilterProvider } from "@/contexts/landscape-filter-context";
import { useLandscapeParams } from "@/hooks/use-landscape-params";
import { trackEvent } from "@/lib/analytics";
import type {
  LandscapeData,
  LandscapeItem,
  Subcategory,
} from "@/types/landscape";
import { CategoryRow } from "./category-row";
import { CommandPalette } from "./command-palette";
import { FilterBar } from "./filter-bar";
import { ItemModal } from "./item-card";
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
    activeItem,
    setQuery,
    setGroupFilter,
    setViewMode,
    setActiveTag,
    setActiveItem,
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

  // Per-category item counts for badges
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

  // Look up active item data across the full (unfiltered) dataset so the
  // dialog works even when the item's category is currently filtered out.
  const activeItemData = useMemo(() => {
    if (!activeItem) return null;
    for (const cat of data.landscape) {
      for (const sub of cat.subcategories) {
        const found = sub.items.find((i) => i.name === activeItem);
        if (found) return found;
      }
    }
    return null;
  }, [data, activeItem]);

  // Keep last known item in a ref so dialog content stays rendered during
  // the exit animation (after activeItemData becomes null).
  const lastItemRef = useRef(activeItemData);
  if (activeItemData) lastItemRef.current = activeItemData;

  const findItem = useCallback(
    (name: string): LandscapeItem | null => {
      for (const cat of data.landscape) {
        for (const sub of cat.subcategories) {
          const found = sub.items.find((i) => i.name === name);
          if (found) return found;
        }
      }
      return null;
    },
    [data],
  );

  // Tier list modal state
  const [tierListData, setTierListData] = useState<{
    categoryName: string;
    subcategory: Subcategory;
    categoryColor?: string;
  } | null>(null);

  // Separate boolean drives the Radix open prop — lets exit animation play
  // before we clear the URL state.
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogItem, setDialogItem] = useState<LandscapeItem | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (activeItemData) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setDialogOpen(true);
    }
  }, [activeItemData]);

  // Cleanup timer on unmount
  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [],
  );

  const handleItemClose = useCallback(() => {
    setDialogOpen(false);
    // Wait for exit animation (duration-100 in DialogContent) then clear URL
    closeTimerRef.current = setTimeout(() => {
      setActiveItem("");
      setDialogItem(null);
      closeTimerRef.current = null;
    }, 150);
  }, [setActiveItem]);

  const contextValue = useMemo(
    () => ({
      query,
      activeTag,
      activeItem,
      tags: data.tags,
      onTagClick: (tag: string) => {
        if (activeTag !== tag) trackEvent("tag_filter_applied", { tag });
        setActiveTag(activeTag === tag ? "" : tag);
      },
      onItemClick: (name: string) => {
        trackEvent("item_viewed", { item_name: name });
        const item = findItem(name);
        setDialogItem(item);
        setDialogOpen(true);
        setActiveItem(name);
      },
      onTierListOpen: (
        categoryName: string,
        subcategory: Subcategory,
        categoryColor?: string,
      ) => {
        setTierListData({ categoryName, subcategory, categoryColor });
      },
    }),
    [
      query,
      activeTag,
      activeItem,
      data.tags,
      setActiveTag,
      setActiveItem,
      findItem,
    ],
  );

  // Track which categories have already animated so filter changes don't
  // re-trigger the entry animation for previously-seen categories.
  const everShownRef = useRef(new Set<string>());
  useEffect(() => {
    for (const cat of filteredData.landscape) {
      everShownRef.current.add(cat.name);
    }
  }, [filteredData.landscape]);

  const modalItem = dialogItem ?? lastItemRef.current;

  return (
    <LandscapeFilterProvider value={contextValue}>
      <CommandPalette data={data} />
      {/* Single Dialog for URL-driven item detail — kept mounted during exit
          animation so data-closed classes can play before unmount */}
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
      {modalItem && (
        <Dialog
          open={dialogOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) handleItemClose();
          }}
        >
          <ItemModal item={modalItem} onClose={handleItemClose} />
        </Dialog>
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
          onViewChange={setViewMode}
          onTagClear={() => setActiveTag("")}
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
