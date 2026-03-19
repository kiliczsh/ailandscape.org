"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { GithubLogo, PlusCircle } from "@phosphor-icons/react/dist/ssr";
import { Suspense, useState } from "react";
import { HeaderSearch } from "@/components/landscape/header-search";
import { ModeToggle } from "@/components/mode-toggle";

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background px-4 py-2">
      {/* Mobile: full-width search overlay */}
      {searchOpen && (
        <div className="flex w-full items-center gap-2 sm:hidden">
          <Suspense>
            <HeaderSearch autoFocus className="w-full" />
          </Suspense>
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Normal header — hidden on mobile when search overlay is open */}
      <div
        className={`flex w-full items-center gap-3 ${searchOpen ? "hidden sm:flex" : "flex"}`}
      >
        <a
          href="/"
          className="flex shrink-0 items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="AI Landscape — home"
        >
          <h1 className="text-sm font-semibold tracking-tight">
            <span className="text-foreground">AI</span>
            <span className="mx-1 text-muted-foreground">{"///"}</span>
            <span className="text-foreground">Landscape</span>
          </h1>
        </a>

        {/* Desktop search — always visible on sm+ */}
        <div className="hidden sm:flex flex-1 justify-center">
          <Suspense>
            <HeaderSearch />
          </Suspense>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* Mobile search icon */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search tools"
            className="flex h-11 w-11 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:hidden"
          >
            <MagnifyingGlass size={16} aria-hidden="true" />
          </button>

          <a
            href="https://github.com/kiliczsh/ailandscape.org/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Submit a tool via GitHub issue (opens in new tab)"
            className="flex h-11 w-11 items-center justify-center gap-1 rounded text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:h-auto sm:w-auto"
          >
            <PlusCircle size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Submit</span>
          </a>

          <a
            href="https://github.com/kiliczsh/ailandscape.org"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub (opens in new tab)"
            className="flex h-11 w-11 items-center justify-center gap-1 rounded text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:h-auto sm:w-auto"
          >
            <GithubLogo size={16} aria-hidden="true" />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
