"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { GithubLogo, PlusCircle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Suspense, useState } from "react";
import { HeaderSearch } from "@/components/landscape/header-search";
import { ModeToggle } from "@/components/mode-toggle";

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-background/80 px-4 py-2.5 shadow-sm backdrop-blur-md dark:shadow-none dark:ring-1 dark:ring-white/5">
      {searchOpen && (
        <div className="flex w-full items-center gap-2 sm:hidden">
          <Suspense>
            <HeaderSearch autoFocus className="w-full" />
          </Suspense>
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      )}

      <div
        className={`flex w-full items-center gap-4 ${searchOpen ? "hidden sm:flex" : "flex"}`}
      >
        <Link
          href="/"
          aria-label="AI Landscape — home"
          className="flex shrink-0 items-center gap-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <h1 className="text-sm font-semibold tracking-tight">
            <span className="text-primary">AI</span>
            <span className="text-foreground"> Landscape</span>
          </h1>
        </Link>

        <div className="hidden flex-1 justify-center sm:flex">
          <Suspense>
            <HeaderSearch className="w-full max-w-sm [&_input]:rounded-full [&_input]:bg-muted/60" />
          </Suspense>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search tools"
            className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden"
          >
            <MagnifyingGlass size={16} aria-hidden="true" />
          </button>

          <a
            href="https://github.com/kiliczsh/ailandscape.org/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Submit a tool"
            className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
          >
            <PlusCircle size={14} aria-hidden="true" />
            Submit
          </a>

          <a
            href="https://github.com/kiliczsh/ailandscape.org"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground ring-1 ring-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <GithubLogo size={15} aria-hidden="true" />
          </a>

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
