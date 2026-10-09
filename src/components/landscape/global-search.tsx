"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { toggleSearch, useSearchState } from "@/lib/search-store";

const loadPalette = () =>
  import("./command-palette").then((m) => {
    m.loadSearchIndex().catch(() => {});
    return m.CommandPalette;
  });

// Loaded on demand: keeps cmdk and the search index out of the initial bundle
const CommandPalette = dynamic(loadPalette, { ssr: false });

/** Warm the palette chunk and search index (e.g. on header input focus). */
export function preloadSearch() {
  loadPalette().catch(() => {});
}

/**
 * Site-wide Cmd+K / Ctrl+K palette. Mounted once in the site header so it
 * works on every route; the palette itself mounts on first open.
 */
export function GlobalSearch() {
  const { open } = useSearchState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleSearch();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  return mounted || open ? <CommandPalette /> : null;
}
