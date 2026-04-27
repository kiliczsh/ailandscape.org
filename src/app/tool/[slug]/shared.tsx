"use client";

import {
  CheckCircle,
  Cube,
  Flask,
  type Icon as PhosphorIconType,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import type {
  Category,
  LandscapeItem,
  Subcategory,
  TagsMap,
} from "@/types/landscape";

export interface ToolDetailProps {
  item: LandscapeItem;
  category: Category;
  subcategory: Subcategory;
  tags: TagsMap;
  related: LandscapeItem[];
}

// Adaptive text color for tag pills based on OKLCH lightness.
// Mirrors the helper in components/landscape/item-card.tsx.
export function getTagTextColor(color: string): string {
  const m = color.match(/oklch\(\s*([\d.]+)/);
  if (!m) return "oklch(0.965 0.009 325)";
  return parseFloat(m[1]) > 0.5
    ? "oklch(0.145 0.008 326)"
    : "oklch(0.965 0.009 325)";
}

const STATUS_META: Record<
  string,
  { icon: PhosphorIconType; label: string; tone: string }
> = {
  graduated: {
    icon: CheckCircle,
    label: "Graduated",
    tone: "text-emerald-700 dark:text-emerald-300",
  },
  incubating: {
    icon: Flask,
    label: "Incubating",
    tone: "text-amber-700 dark:text-amber-300",
  },
  sandbox: {
    icon: Cube,
    label: "Sandbox",
    tone: "text-sky-700 dark:text-sky-300",
  },
};

export function ProjectStatusBadge({
  status,
  className = "",
}: {
  status: string | undefined;
  className?: string;
}) {
  if (!status) return null;
  const meta = STATUS_META[status];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <Badge
      variant="secondary"
      className={`gap-1 py-1 pr-2 pl-1.5 text-xs font-medium ${meta.tone} ${className}`}
    >
      <Icon size={12} weight="fill" aria-hidden="true" />
      {meta.label}
    </Badge>
  );
}

export function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
