"use client";

import { useSyncExternalStore } from "react";

/**
 * Global command-palette state. Shared by the header search input (on routes
 * without the landscape grid) and the Cmd+K palette mounted in the site header.
 */
export interface SearchState {
  open: boolean;
  query: string;
}

const CLOSED: SearchState = { open: false, query: "" };

let state: SearchState = CLOSED;
const listeners = new Set<() => void>();

function emit(next: SearchState) {
  state = next;
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function openSearch(query = "") {
  emit({ open: true, query });
}

export function setSearchQuery(query: string) {
  emit({ ...state, query });
}

export function closeSearch() {
  emit(CLOSED);
}

export function toggleSearch() {
  if (state.open) closeSearch();
  else openSearch();
}

export function useSearchState(): SearchState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => CLOSED,
  );
}
