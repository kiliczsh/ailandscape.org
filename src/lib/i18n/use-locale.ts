"use client";

import { usePathname } from "next/navigation";
import { ZH_CATEGORIES } from "@/lib/i18n/zh";

export function isZhPath(pathname: string | null): boolean {
  return pathname === "/zh" || !!pathname?.startsWith("/zh/");
}

// Locale derived from the URL, the same mechanism the language toggle and
// command palette use. Returns the route prefix and a category label lookup.
export function useLocale() {
  const isZh = isZhPath(usePathname());
  return {
    isZh,
    prefix: isZh ? "/zh" : "",
    categoryLabel: (name: string) =>
      isZh ? (ZH_CATEGORIES[name]?.name ?? name) : name,
  };
}
