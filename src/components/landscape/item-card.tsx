"use client";

import {
  ArrowSquareOutIcon,
  GithubLogoIcon,
  XLogoIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLandscapeFilter } from "@/contexts/landscape-filter-context";
import { trackEvent } from "@/lib/analytics";
import { appendUtm } from "@/lib/utm";
import type { LandscapeItem } from "@/types/landscape";
import { HighlightText } from "./highlight-text";

interface ItemCardProps {
  item: LandscapeItem;
  viewMode?: "grid" | "card";
  categoryColor?: string;
  priority?: boolean;
}

// Adaptive text color for tag badges — mirrors getTextClass() in subcategory-section.tsx.
// White text on OKLCH L ≤ 0.5 (dark bg); near-black token on L > 0.5 (light bg).
function getTagTextColor(color: string): string {
  const m = color.match(/oklch\(\s*([\d.]+)/);
  if (!m) return "#fff";
  return parseFloat(m[1]) > 0.5 ? "oklch(0.145 0.008 326)" : "#fff";
}

// Deterministic color for initials fallback — consistent per item name
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

// logo → initials
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

export function ItemModal({
  item,
  onClose,
}: {
  item: LandscapeItem;
  onClose: () => void;
}) {
  const { onTagClick, tags } = useLandscapeFilter();

  function handleTagClick(tag: string) {
    onTagClick(tag);
    onClose();
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border border-border bg-card">
            <ItemAvatar
              name={item.name}
              logo={item.logo}
              containerClass="h-full w-full rounded-lg"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <DialogTitle className="truncate text-base font-bold leading-tight">
              {item.name}
            </DialogTitle>
          </div>
        </div>
      </DialogHeader>

      {item.description && (
        <DialogDescription className="text-sm/relaxed">
          {item.description}
        </DialogDescription>
      )}

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => {
            const meta = tags[tag];
            return (
              <button
                key={tag}
                type="button"
                aria-label={`Filter by tag: ${meta?.label ?? tag}`}
                onClick={() => handleTagClick(tag)}
                className="cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Badge
                  variant="secondary"
                  className="pointer-events-none px-2 py-0.5 text-xs"
                  style={
                    meta?.color
                      ? {
                          backgroundColor: meta.color,
                          color: getTagTextColor(meta.color),
                        }
                      : undefined
                  }
                >
                  {meta?.label ?? tag}
                </Badge>
              </button>
            );
          })}
        </div>
      )}

      {(item.homepage_url || item.repo_url || item.twitter_url) && (
        <DialogFooter className="flex-row gap-2 sm:justify-start">
          {item.homepage_url && (
            <Button asChild size="sm" className="gap-1.5">
              <a
                href={appendUtm(item.homepage_url, "website")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("external_link_clicked", {
                    item_name: item.name,
                    link_type: "website",
                  })
                }
              >
                <ArrowSquareOutIcon className="h-3.5 w-3.5" />
                Visit Website
              </a>
            </Button>
          )}
          {item.repo_url && (
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a
                href={appendUtm(item.repo_url, "repo")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("external_link_clicked", {
                    item_name: item.name,
                    link_type: "repo",
                  })
                }
              >
                <GithubLogoIcon className="h-3.5 w-3.5" />
                GitHub / Repo
              </a>
            </Button>
          )}
          {item.twitter_url && (
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a
                href={appendUtm(item.twitter_url, "x")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("external_link_clicked", {
                    item_name: item.name,
                    link_type: "twitter",
                  })
                }
              >
                <XLogoIcon className="h-3.5 w-3.5" />X / Twitter
              </a>
            </Button>
          )}
        </DialogFooter>
      )}
    </DialogContent>
  );
}

export function ItemCard({
  item,
  viewMode = "grid",
  categoryColor,
  priority = false,
}: ItemCardProps) {
  const { query, onItemClick } = useLandscapeFilter();

  if (viewMode === "card") {
    return (
      <button
        type="button"
        aria-label={item.name}
        onClick={() => onItemClick(item.name)}
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
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={item.name}
      onClick={() => onItemClick(item.name)}
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
    </button>
  );
}
