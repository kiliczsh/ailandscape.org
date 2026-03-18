"use client";

import { createContext, useContext } from "react";
import type { TagsMap } from "@/types/landscape";

interface LandscapeFilterContextValue {
  query: string;
  activeTag: string;
  activeItem: string;
  tags: TagsMap;
  onTagClick: (tag: string) => void;
  onItemClick: (item: string) => void;
}

const LandscapeFilterContext = createContext<LandscapeFilterContextValue>({
  query: "",
  activeTag: "",
  activeItem: "",
  tags: {},
  onTagClick: () => {},
  onItemClick: () => {},
});

export function LandscapeFilterProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: LandscapeFilterContextValue;
}) {
  return (
    <LandscapeFilterContext.Provider value={value}>
      {children}
    </LandscapeFilterContext.Provider>
  );
}

export function useLandscapeFilter() {
  return useContext(LandscapeFilterContext);
}
