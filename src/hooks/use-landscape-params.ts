"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import type { CategoryGroup } from "@/types/landscape";

type GroupFilter = "all" | CategoryGroup;
type ViewMode = "grid" | "card";

const VALID_GROUPS: GroupFilter[] = [
  "all",
  "core-ai",
  "infrastructure",
  "engineering",
  "products",
  "governance",
  "ecosystem",
];
const VALID_VIEWS: ViewMode[] = ["grid", "card"];

function validGroup(v: string | null): GroupFilter {
  return VALID_GROUPS.includes(v as GroupFilter) ? (v as GroupFilter) : "all";
}
function validView(v: string | null): ViewMode {
  return VALID_VIEWS.includes(v as ViewMode) ? (v as ViewMode) : "grid";
}

export function useLandscapeParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const groupFilter = validGroup(searchParams.get("group"));
  const viewMode = validView(searchParams.get("view"));
  const activeTag = searchParams.get("tag") ?? "";
  const activeItem = searchParams.get("item") ?? "";
  const activeCategory = searchParams.get("category") ?? "";

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setQuery = useCallback(
    (q: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (q) {
          params.set("q", q);
        } else {
          params.delete("q");
        }
        router.replace(`?${params.toString()}`);
      }, 150);
    },
    [router, searchParams],
  );

  const setGroupFilter = useCallback(
    (group: GroupFilter) => {
      const params = new URLSearchParams(searchParams.toString());
      if (group === "all") {
        params.delete("group");
      } else {
        params.set("group", group);
      }
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const setViewMode = useCallback(
    (view: ViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (view === "grid") {
        params.delete("view");
      } else {
        params.set("view", view);
      }
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const setActiveTag = useCallback(
    (tag: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tag) {
        params.set("tag", tag);
      } else {
        params.delete("tag");
      }
      // Clear activeItem when changing tag
      params.delete("item");
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const setActiveItem = useCallback(
    (item: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (item) {
        params.set("item", item);
      } else {
        params.delete("item");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const setActiveCategory = useCallback(
    (category: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (category) {
        params.set("category", category);
      } else {
        params.delete("category");
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return {
    query,
    groupFilter,
    viewMode,
    activeTag,
    activeItem,
    activeCategory,
    setQuery,
    setGroupFilter,
    setViewMode,
    setActiveTag,
    setActiveItem,
    setActiveCategory,
  };
}
