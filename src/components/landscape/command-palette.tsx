"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { trackEvent } from "@/lib/analytics";
import { useLocale } from "@/lib/i18n/use-locale";
import { ZH_CATEGORIES } from "@/lib/i18n/zh";
import {
  closeSearch,
  openSearch,
  setSearchQuery,
  useSearchState,
} from "@/lib/search-store";
import { toSlug } from "@/lib/slug";

const MAX_VISIBLE = 50;

interface SearchIndex {
  categories: string[];
  items: [
    name: string,
    subcategory: string,
    categoryIndex: number,
    aliases?: string[],
  ][];
}

let indexPromise: Promise<SearchIndex> | null = null;

/** Fetches the compact search index once per page load. */
export function loadSearchIndex(): Promise<SearchIndex> {
  if (!indexPromise) {
    // no-cache: always revalidate so data edits (e.g. new aliases) show up
    indexPromise = fetch("/search-index.json", { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`search index ${r.status}`);
        return r.json() as Promise<SearchIndex>;
      })
      .catch((err) => {
        indexPromise = null;
        throw err;
      });
  }
  return indexPromise;
}

interface FlatItem {
  name: string;
  aliases: string[];
  category: string;
  subcategory: string;
  /** Pre-lowered item name — primary match target */
  nameLower: string;
  /** Pre-lowered alternate names (e.g. native-script names like 阶跃星辰) */
  aliasesLower: string[];
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
  aliasesLower: string[],
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

  // 1b. Exact substring on an alias (works for CJK: plain indexOf, no ASCII folding)
  let aliasScore = 0;
  for (const alias of aliasesLower) {
    const idx = alias.indexOf(search);
    if (idx === 0) {
      aliasScore = 92;
      break;
    }
    if (idx > 0) aliasScore = 85;
  }
  if (aliasScore) return aliasScore;

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

const MAX_CATEGORIES = 5;

export function CommandPalette() {
  const { open, query: search } = useSearchState();
  const router = useRouter();
  const { isZh, prefix, categoryLabel } = useLocale();
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!open || index) return;
    setLoadFailed(false);
    let cancelled = false;
    loadSearchIndex()
      .then((idx) => {
        if (!cancelled) setIndex(idx);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, index]);

  // Flatten all items once
  const flatItems = useMemo<FlatItem[]>(() => {
    if (!index) return [];
    return index.items.map(([name, subcategory, ci, aliases = []]) => {
      const category = index.categories[ci] ?? "";
      return {
        name,
        category,
        subcategory,
        aliases,
        nameLower: name.toLowerCase(),
        aliasesLower: aliases.map((a) => a.toLowerCase()),
        searchValue:
          `${name} ${aliases.join(" ")} ${subcategory} ${category}`.toLowerCase(),
      };
    });
  }, [index]);

  const lowerSearch = search.trim().toLowerCase();

  // Compute scored + capped results
  const results = useMemo(() => {
    if (!lowerSearch) {
      // No query: show first MAX_VISIBLE items grouped by category
      return flatItems.slice(0, MAX_VISIBLE);
    }

    // Score all items
    const scored: { entry: FlatItem; score: number }[] = [];
    for (const entry of flatItems) {
      const score = fuzzyScore(
        entry.nameLower,
        entry.aliasesLower,
        entry.searchValue,
        lowerSearch,
      );
      if (score > 0) {
        scored.push({ entry, score });
      }
    }

    // Sort by score descending, then alphabetically
    scored.sort(
      (a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name),
    );

    return scored.slice(0, MAX_VISIBLE).map((s) => s.entry);
  }, [flatItems, lowerSearch]);

  // Category pages matching the query (only when searching)
  const categoryMatches = useMemo(() => {
    if (!index || lowerSearch.length < 2) return [];
    return index.categories
      .filter(
        (name) =>
          name.toLowerCase().includes(lowerSearch) ||
          (isZh && ZH_CATEGORIES[name]?.name.includes(lowerSearch)),
      )
      .slice(0, MAX_CATEGORIES);
  }, [index, lowerSearch, isZh]);

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

  // Track settled palette queries (grid search tracks its own, without source)
  const lastTrackedRef = useRef("");
  useEffect(() => {
    if (!open) {
      lastTrackedRef.current = "";
      return;
    }
    if (!index || lowerSearch.length < 2) return;
    if (lowerSearch === lastTrackedRef.current) return;
    const t = setTimeout(() => {
      lastTrackedRef.current = lowerSearch;
      trackEvent("search_query", {
        query: lowerSearch,
        result_count: results.length,
        source: "palette",
      });
    }, 800);
    return () => clearTimeout(t);
  }, [open, index, lowerSearch, results.length]);

  function handleSelect(name: string) {
    trackEvent("search_item_selected", {
      item_name: name,
      search_term: search.trim(),
    });
    closeSearch();
    router.push(`/tool/${toSlug(name)}`);
  }

  function handleCategorySelect(name: string) {
    trackEvent("search_item_selected", {
      item_name: name,
      item_type: "category",
      search_term: search.trim(),
    });
    closeSearch();
    router.push(`${prefix}/category/${toSlug(name)}`);
  }

  // Disable cmdk's built-in filter — we handle it ourselves
  const noFilter = useCallback(() => 1, []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => (next ? openSearch(search) : closeSearch())}
      title="Search tools"
      description="Search across all AI tools and categories"
      filter={noFilter}
    >
      <CommandInput
        placeholder="Search tools..."
        aria-label="Search tools"
        value={search}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          {index
            ? "No results found."
            : loadFailed
              ? "Couldn't load search. Close and reopen to retry."
              : "Loading…"}
        </CommandEmpty>
        {[...grouped.entries()].map(([category, items]) => (
          <CommandGroup key={category} heading={categoryLabel(category)}>
            {items.map((entry) => (
              <CommandItem
                key={`${entry.category}-${entry.subcategory}-${entry.name}`}
                value={entry.searchValue}
                onSelect={() => handleSelect(entry.name)}
                className="cursor-pointer"
              >
                <span className="font-medium">{entry.name}</span>
                {entry.aliases.length > 0 && (
                  <span className="truncate text-muted-foreground">
                    {entry.aliases.join(", ")}
                  </span>
                )}
                <span className="ml-auto text-muted-foreground">
                  {entry.subcategory}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        {categoryMatches.length > 0 && (
          <CommandGroup heading="Categories">
            {categoryMatches.map((name) => (
              <CommandItem
                key={`category-${name}`}
                value={`category ${name.toLowerCase()}`}
                onSelect={() => handleCategorySelect(name)}
                className="cursor-pointer"
              >
                <span className="font-medium">{categoryLabel(name)}</span>
                <span className="ml-auto text-muted-foreground">Category</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
