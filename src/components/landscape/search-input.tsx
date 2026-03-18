"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  className,
  autoFocus,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const syncedRef = useRef(value);

  // Keep local state in sync when URL param changes externally (e.g., browser back/forward)
  useEffect(() => {
    if (value !== syncedRef.current) {
      setLocalValue(value);
      syncedRef.current = value;
    }
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setLocalValue(v);
    syncedRef.current = v;
    onChange(v);
  }

  function handleClear() {
    setLocalValue("");
    syncedRef.current = "";
    onChange("");
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      <MagnifyingGlass
        size={14}
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 text-muted-foreground"
      />
      <input
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder="Search tools..."
        aria-label="Search tools"
        // biome-ignore lint/a11y/noAutofocus: intentional for mobile search overlay
        autoFocus={autoFocus}
        className="h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-8 text-base sm:text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      />
      {localValue ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-0 flex h-9 w-9 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={14} aria-hidden="true" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-2 hidden select-none rounded border border-border bg-muted px-1 text-[10px] text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      )}
    </div>
  );
}
