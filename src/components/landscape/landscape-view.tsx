"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { LandscapeFilterProvider } from "@/contexts/landscape-filter-context";
import { useLandscapeParams } from "@/hooks/use-landscape-params";
import { trackEvent } from "@/lib/analytics";
import type { LandscapeData, LandscapeItem } from "@/types/landscape";
import { SubcategoryCard } from "./category-card";
import { CommandPalette } from "./command-palette";
import { FilterBar } from "./filter-bar";
import { ItemAvatar, ItemModal } from "./item-card";
import { TierListPanel } from "./tier-list-panel";

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

  // Per-category item counts for badges / CategoryRow
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

  // Cleanup timers on unmount
  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (panelCloseTimerRef.current) clearTimeout(panelCloseTimerRef.current);
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

  // Selected subcategory for tier list: { categoryName, subIndex }
  const [selected, setSelected] = useState<{
    categoryName: string;
    subIndex: number;
  } | null>(null);

  // Track which category panel is animating closed so it stays mounted
  // during the CSS grid collapse animation before unmounting.
  const [closingCategoryName, setClosingCategoryName] = useState<string | null>(
    null,
  );
  const panelCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePanelClose = useCallback(() => {
    const name = selected?.categoryName ?? null;
    setSelected(null);
    if (name) {
      setClosingCategoryName(name);
      panelCloseTimerRef.current = setTimeout(() => {
        setClosingCategoryName(null);
        panelCloseTimerRef.current = null;
      }, 350);
    }
  }, [selected]);

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
        <div className="flex-1 overflow-y-auto">
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
          ) : viewMode === "grid" ? (
            <div className="flex flex-col">
              {filteredData.landscape.map((category) => {
                const color = category.color ?? "oklch(0.4 0.14 265)";
                const isThisCategorySelected =
                  selected?.categoryName === category.name;

                return (
                  <div
                    key={category.name}
                    className="border-b border-border last:border-b-0"
                  >
                    {/* Category header */}
                    <div
                      className="flex items-center gap-2 px-4 py-2 border-b border-border/40"
                      style={{ backgroundColor: `${color}18` }}
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span
                        className="text-sm font-bold tracking-wide"
                        style={{ color }}
                      >
                        {category.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {categoryTotalCounts[category.name] ?? 0} tools
                      </span>
                    </div>

                    {/* Subcategory rows */}
                    <div className="divide-y divide-border/30">
                      {category.subcategories.map((sub, subIndex) => {
                        const isSubSelected =
                          isThisCategorySelected &&
                          selected?.subIndex === subIndex;

                        return (
                          <div key={sub.name} className="px-4 py-3">
                            {/* Subcategory label — click to open tier list */}
                            <button
                              type="button"
                              onClick={() =>
                                setSelected(
                                  isSubSelected
                                    ? null
                                    : { categoryName: category.name, subIndex },
                                )
                              }
                              className="flex items-center gap-1.5 mb-2.5 group"
                            >
                              <span
                                className="text-xs font-semibold transition-opacity group-hover:opacity-100 opacity-70"
                                style={{ color }}
                              >
                                {sub.name}
                              </span>
                              <span
                                className="rounded px-1 py-0.5 text-[9px] font-bold text-white shrink-0"
                                style={{ backgroundColor: color }}
                              >
                                {sub.items.length}
                              </span>
                            </button>

                            {/* Items grid */}
                            <div className="flex flex-wrap gap-1.5">
                              {sub.items.map((item) => (
                                <button
                                  key={item.name}
                                  type="button"
                                  onClick={() =>
                                    contextValue.onItemClick(item.name)
                                  }
                                  className="flex flex-col items-center gap-1 rounded-lg p-1.5 hover:bg-accent/60 transition-colors cursor-pointer"
                                  style={{ width: 72 }}
                                  title={item.name}
                                >
                                  <div className="w-12 h-12 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-background/80">
                                    <ItemAvatar
                                      name={item.name}
                                      logo={item.logo}
                                      containerClass="h-full w-full rounded-lg"
                                    />
                                  </div>
                                  <span className="w-full line-clamp-2 text-center text-[10px] leading-tight text-foreground/70">
                                    {item.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Tier list panel */}
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                        isThisCategorySelected
                          ? "grid-rows-[1fr]"
                          : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        {(isThisCategorySelected ||
                          closingCategoryName === category.name) && (
                          <TierListPanel
                            categoryName={category.name}
                            categoryColor={category.color}
                            subcategories={category.subcategories}
                            initialTab={
                              isThisCategorySelected
                                ? (selected?.subIndex ?? 0)
                                : 0
                            }
                            onClose={handlePanelClose}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 p-4 items-start">
              {filteredData.landscape.map((category) => {
                const color = category.color ?? "oklch(0.4 0.14 265)";
                const isThisCategorySelected =
                  selected?.categoryName === category.name;

                return (
                  <div
                    key={category.name}
                    className="flex flex-col gap-3 min-w-0"
                  >
                    {/* Small colored category title */}
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span
                        className="text-sm font-bold tracking-wide"
                        style={{ color }}
                      >
                        {category.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {categoryTotalCounts[category.name] ?? 0} tools
                      </span>
                    </div>

                    {/* Subcategories — flex-wrap, natural sizing */}
                    <div className="flex flex-wrap gap-3">
                      {category.subcategories.map((sub, subIndex) => (
                        <SubcategoryCard
                          key={sub.name}
                          subcategory={sub}
                          categoryColor={color}
                          isSelected={
                            isThisCategorySelected &&
                            selected?.subIndex === subIndex
                          }
                          onClick={() =>
                            setSelected(
                              isThisCategorySelected &&
                                selected?.subIndex === subIndex
                                ? null
                                : { categoryName: category.name, subIndex },
                            )
                          }
                        />
                      ))}
                    </div>

                    {/* Tier list panel — stays mounted during close animation */}
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                        isThisCategorySelected
                          ? "grid-rows-[1fr]"
                          : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        {(isThisCategorySelected ||
                          closingCategoryName === category.name) && (
                          <TierListPanel
                            categoryName={category.name}
                            categoryColor={category.color}
                            subcategories={category.subcategories}
                            initialTab={
                              isThisCategorySelected
                                ? (selected?.subIndex ?? 0)
                                : 0
                            }
                            onClose={handlePanelClose}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </LandscapeFilterProvider>
  );
}
