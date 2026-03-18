"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useLandscapeFilter } from "@/contexts/landscape-filter-context";
import { trackEvent } from "@/lib/analytics";
import type { LandscapeData, LandscapeItem } from "@/types/landscape";

const MAX_VISIBLE = 50;

interface FlatItem {
  item: LandscapeItem;
  category: string;
  subcategory: string;
  /** Pre-lowered item name — primary match target */
  nameLower: string;
  /** Pre-lowered full search value (name + subcategory + category) */
  searchValue: string;
}

/**
 * Fuzzy match scorer — returns 0 (no match) or 1–100 (higher = better).
 *
 * Scores the item name first (primary). If the name doesn't match,
 * falls back to the full search value (name + subcategory + category)
 * but only accepts exact substring matches there — no fuzzy on context
 * to prevent scattered-character false positives like "mistral" → "magick".
 */
function fuzzyScore(
  nameLower: string,
  fullValue: string,
  search: string,
): number {
  if (!search) return 1;
  const sLen = search.length;

  // 1. Try exact substring on item name (highest quality)
  const nameSubIdx = nameLower.indexOf(search);
  if (nameSubIdx !== -1) {
    if (nameSubIdx === 0) return 100;
    if (nameSubIdx > 0 && /[\s\-_./]/.test(nameLower.charAt(nameSubIdx - 1)))
      return 95;
    return 90;
  }

  // 2. Fuzzy match on item name only
  const nameScore = fuzzyWalk(nameLower, search);
  if (nameScore > 0) return nameScore;

  // 3. Fallback: exact substring on full value (subcategory/category context)
  // No fuzzy here — avoids scattered false positives across long strings
  if (sLen <= fullValue.length && fullValue.includes(search)) {
    return 60;
  }

  return 0;
}

/** Greedy fuzzy walk — returns 0 or 40–89. */
function fuzzyWalk(target: string, search: string): number {
  const tLen = target.length;
  const sLen = search.length;
  if (sLen > tLen) return 0;

  let si = 0;
  let consecutive = 0;
  let maxConsecutive = 0;
  let boundaryMatches = 0;
  let prevMatchIdx = -2;

  for (let ti = 0; ti < tLen && si < sLen; ti++) {
    if (target.charAt(ti) === search.charAt(si)) {
      if (ti === prevMatchIdx + 1) {
        consecutive++;
      } else {
        consecutive = 1;
      }
      maxConsecutive = Math.max(maxConsecutive, consecutive);
      if (ti === 0 || /[\s\-_./]/.test(target.charAt(ti - 1))) {
        boundaryMatches++;
      }
      prevMatchIdx = ti;
      si++;
    }
  }

  if (si < sLen) return 0;

  // Require at least 2 consecutive chars for queries of 3+ to filter noise
  if (sLen >= 3 && maxConsecutive < 2) return 0;

  const consecutiveScore = Math.min((maxConsecutive / sLen) * 30, 30);
  const boundaryScore = Math.min((boundaryMatches / sLen) * 20, 20);
  const coverageScore = (sLen / tLen) * 10;

  return Math.round(40 + consecutiveScore + boundaryScore + coverageScore);
}

interface CommandPaletteProps {
  data: LandscapeData;
}

export function CommandPalette({ data }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { onItemClick } = useLandscapeFilter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  // Flatten all items once
  const flatItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = [];
    for (const cat of data.landscape) {
      for (const sub of cat.subcategories) {
        for (const item of sub.items) {
          items.push({
            item,
            category: cat.name,
            subcategory: sub.name,
            nameLower: item.name.toLowerCase(),
            searchValue: `${item.name} ${sub.name} ${cat.name}`.toLowerCase(),
          });
        }
      }
    }
    return items;
  }, [data]);

  // Compute scored + capped results
  const results = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase();
    if (!lowerSearch) {
      // No query: show first MAX_VISIBLE items grouped by category
      return flatItems.slice(0, MAX_VISIBLE);
    }

    // Score all items
    const scored: { entry: FlatItem; score: number }[] = [];
    for (const entry of flatItems) {
      const score = fuzzyScore(entry.nameLower, entry.searchValue, lowerSearch);
      if (score > 0) {
        scored.push({ entry, score });
      }
    }

    // Sort by score descending, then alphabetically
    scored.sort(
      (a, b) =>
        b.score - a.score || a.entry.item.name.localeCompare(b.entry.item.name),
    );

    return scored.slice(0, MAX_VISIBLE).map((s) => s.entry);
  }, [flatItems, search]);

  // Group results by category for display
  const grouped = useMemo(() => {
    const map = new Map<string, FlatItem[]>();
    for (const entry of results) {
      const group = map.get(entry.category);
      if (group) {
        group.push(entry);
      } else {
        map.set(entry.category, [entry]);
      }
    }
    return map;
  }, [results]);

  function handleSelect(item: LandscapeItem) {
    trackEvent("search_item_selected", {
      item_name: item.name,
      search_term: search.trim(),
    });
    setOpen(false);
    onItemClick(item.name);
  }

  // Disable cmdk's built-in filter — we handle it ourselves
  const noFilter = useCallback(() => 1, []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search tools"
      description="Search across all AI tools and categories"
      filter={noFilter}
    >
      <CommandInput
        placeholder="Search tools..."
        aria-label="Search tools"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {[...grouped.entries()].map(([category, items]) => (
          <CommandGroup key={category} heading={category}>
            {items.map((entry) => (
              <CommandItem
                key={`${entry.category}-${entry.subcategory}-${entry.item.name}`}
                value={entry.searchValue}
                onSelect={() => handleSelect(entry.item)}
                className="cursor-pointer"
              >
                <span className="font-medium">{entry.item.name}</span>
                <span className="ml-auto text-muted-foreground">
                  {entry.subcategory}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
