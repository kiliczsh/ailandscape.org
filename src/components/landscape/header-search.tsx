"use client";

import { usePathname } from "next/navigation";
import { useLandscapeParams } from "@/hooks/use-landscape-params";
import { openSearch, useSearchState } from "@/lib/search-store";
import { preloadSearch } from "./global-search";
import { SearchInput } from "./search-input";

// Routes that render the landscape grid, which filters itself from ?q=
const GRID_ROUTES = new Set(["/", "/zh"]);

interface HeaderSearchProps {
  autoFocus?: boolean;
  className?: string;
}

export function HeaderSearch(props: HeaderSearchProps) {
  const pathname = usePathname();
  return GRID_ROUTES.has(pathname) ? (
    <GridSearch {...props} />
  ) : (
    <PaletteSearch {...props} />
  );
}

/** Home: filters the landscape grid via the ?q= URL param. */
function GridSearch({ autoFocus, className }: HeaderSearchProps) {
  const { query, setQuery } = useLandscapeParams();
  return (
    <SearchInput
      value={query}
      onChange={setQuery}
      autoFocus={autoFocus}
      className={className ?? "w-full max-w-[160px] sm:max-w-[224px]"}
    />
  );
}

/** Other routes: typing opens the global command palette with the query. */
function PaletteSearch({ autoFocus, className }: HeaderSearchProps) {
  const { open, query } = useSearchState();
  return (
    <SearchInput
      value={open ? query : ""}
      onChange={(v) => {
        if (v) openSearch(v);
      }}
      onFocus={preloadSearch}
      autoFocus={autoFocus}
      className={className ?? "w-full max-w-[160px] sm:max-w-[224px]"}
    />
  );
}
