"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Only routes with a real translated counterpart get a toggle target.
function counterpartFor(pathname: string): { href: string; label: string } {
  if (pathname === "/zh" || pathname.startsWith("/zh/")) {
    const en = pathname === "/zh" ? "/" : pathname.slice(3);
    return { href: en, label: "EN" };
  }
  if (pathname === "/") return { href: "/zh", label: "中文" };
  if (pathname.startsWith("/category/"))
    return { href: `/zh${pathname}`, label: "中文" };
  return { href: "/zh", label: "中文" };
}

export function LanguageToggle() {
  const pathname = usePathname();
  const { href, label } = counterpartFor(pathname);

  return (
    <Link
      href={href}
      aria-label={label === "EN" ? "Switch to English" : "切换到中文"}
      className="flex h-8 items-center justify-center rounded-full px-2.5 text-xs font-medium text-muted-foreground ring-1 ring-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {label}
    </Link>
  );
}
