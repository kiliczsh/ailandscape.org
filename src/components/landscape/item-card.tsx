"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLandscapeFilter } from "@/contexts/landscape-filter-context";
import { trackEvent } from "@/lib/analytics";
import { toSlug } from "@/lib/slug";
import type { LandscapeItem } from "@/types/landscape";
import { HighlightText } from "./highlight-text";

interface ItemCardProps {
  item: LandscapeItem;
  viewMode?: "grid" | "card";
  categoryColor?: string;
  priority?: boolean;
}

const INITIALS_HUES = [285, 160, 55, 310, 220, 130, 30, 250];
function getInitialsStyle(name: string): { background: string; color: string } {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = INITIALS_HUES[hash % INITIALS_HUES.length];
  return {
    background: `oklch(0.90 0.07 ${hue})`,
    color: `oklch(0.38 0.14 ${hue})`,
  };
}

function getInitials(name: string): string {
  const words = name.split(/[\s\-_./]/).filter(Boolean);
  if (words.length === 0) return name.charAt(0)?.toUpperCase() || "?";
  const initials = words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return initials || name.charAt(0)?.toUpperCase() || "?";
}

type ImgStage = "logo" | "initials";

export function ItemAvatar({
  name,
  logo,
  containerClass,
  priority = false,
}: {
  name: string;
  logo?: string;
  containerClass: string;
  priority?: boolean;
}) {
  const initialStage: ImgStage = logo ? "logo" : "initials";
  const [stage, setStage] = useState<ImgStage>(initialStage);

  useEffect(() => {
    setStage(logo ? "logo" : "initials");
  }, [logo]);

  if (stage === "logo" && logo) {
    return (
      <div className={`${containerClass} relative overflow-hidden`}>
        <Image
          src={`/logos/${logo}`}
          alt={name}
          fill
          sizes="(max-width: 640px) 64px, 80px"
          className="object-contain p-1"
          priority={priority}
          onError={() => setStage("initials")}
        />
      </div>
    );
  }

  const initialsStyle = getInitialsStyle(name);
  return (
    <div
      className={`${containerClass} flex items-center justify-center rounded text-xs font-bold`}
      style={initialsStyle}
    >
      {getInitials(name)}
    </div>
  );
}

export function ItemCard({
  item,
  viewMode = "grid",
  categoryColor,
  priority = false,
}: ItemCardProps) {
  const { query } = useLandscapeFilter();
  const href = `/tool/${toSlug(item.name)}`;

  function handleClick() {
    trackEvent("item_viewed", { item_name: item.name });
  }

  if (viewMode === "card") {
    return (
      <Link
        href={href}
        aria-label={item.name}
        onClick={handleClick}
        className="flex w-full min-h-[44px] items-center gap-2 rounded border-2 border-border bg-card px-2 py-1.5 cursor-pointer transition-[transform,box-shadow] duration-150 hover:scale-[1.02] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        style={categoryColor ? { borderColor: categoryColor } : undefined}
      >
        <ItemAvatar
          name={item.name}
          logo={item.logo}
          containerClass="h-8 w-8 shrink-0 rounded"
          priority={priority}
        />
        <span className="min-w-0 truncate text-sm text-foreground">
          <HighlightText text={item.name} query={query} />
          {item.description && (
            <span className="text-muted-foreground"> — {item.description}</span>
          )}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-label={item.name}
      onClick={handleClick}
      className="flex cursor-pointer flex-col items-center gap-1 rounded transition-[transform,box-shadow] duration-150 hover:scale-[1.03] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
    >
      <div
        className="w-16 h-16 sm:w-[80px] sm:h-[80px] flex shrink-0 items-center justify-center overflow-hidden rounded border-2 border-border bg-card"
        style={categoryColor ? { borderColor: categoryColor } : undefined}
      >
        <ItemAvatar
          name={item.name}
          logo={item.logo}
          containerClass="h-full w-full rounded"
          priority={priority}
        />
      </div>
      <span className="w-16 sm:w-[80px] h-8 line-clamp-2 break-words text-center text-xs leading-tight text-foreground">
        <HighlightText text={item.name} query={query} />
      </span>
    </Link>
  );
}
