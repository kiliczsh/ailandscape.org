"use client";

import { useLandscapeParams } from "@/hooks/use-landscape-params";
import { SearchInput } from "./search-input";

export function HeaderSearch({
  autoFocus,
  className,
}: {
  autoFocus?: boolean;
  className?: string;
}) {
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
