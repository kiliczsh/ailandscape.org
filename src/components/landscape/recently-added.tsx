"use client";

import { Sparkle } from "@phosphor-icons/react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { toSlug } from "@/lib/slug";
import type { Category, LandscapeItem, Subcategory } from "@/types/landscape";
import { ItemAvatar } from "./item-card";

interface RecentlyAddedItem {
  item: LandscapeItem;
  category: Category;
  subcategory: Subcategory;
}

interface RecentlyAddedProps {
  items: RecentlyAddedItem[];
}

function formatRelative(dateStr?: string): string {
  if (!dateStr) return "";
  const then = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return "today";
  if (diffDays === 1) return "1d ago";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function RecentlyAdded({ items }: RecentlyAddedProps) {
  if (items.length === 0) return null;

  return (
    <section
      aria-label="Recently added tools"
      className="flex items-center gap-2 overflow-x-auto border-b border-border bg-muted/30 px-3 py-2"
    >
      <div className="flex shrink-0 items-center gap-1 pr-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Sparkle size={12} weight="fill" aria-hidden="true" />
        New
      </div>
      <ul className="flex flex-1 items-center gap-2">
        {items.map(({ item, category, subcategory }) => {
          const slug = toSlug(item.name);
          return (
            <li key={slug} className="shrink-0">
              <Link
                href={`/tool/${slug}`}
                onClick={() =>
                  trackEvent("recently_added_click", {
                    item_slug: slug,
                    category: category.name,
                  })
                }
                className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-xs transition-[transform,box-shadow] duration-150 hover:scale-[1.02] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title={`${item.name} — ${category.name} › ${subcategory.name}`}
              >
                <ItemAvatar
                  name={item.name}
                  logo={item.logo}
                  containerClass="h-5 w-5 shrink-0 rounded"
                />
                <span className="font-medium text-foreground">{item.name}</span>
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {formatRelative(item.added_at)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
