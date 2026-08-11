import Link from "next/link";
import { toSlug } from "@/lib/slug";
import type { LandscapeData } from "@/types/landscape";

interface CategoryDirectoryProps {
  data: LandscapeData;
  // Locale support: override displayed names and link prefix (e.g. /zh)
  labels?: Record<string, string>;
  basePath?: string;
}

// Server-rendered so crawlers see links to every category page in the
// initial HTML — the interactive landscape below only exists after hydration.
export function CategoryDirectory({
  data,
  labels,
  basePath = "",
}: CategoryDirectoryProps) {
  return (
    <nav
      aria-label="Browse categories"
      className="flex flex-wrap items-center gap-1.5 border-b border-border px-3 py-2"
    >
      {data.landscape.map((category) => {
        const count = category.subcategories.reduce(
          (sum, sub) => sum + sub.items.length,
          0,
        );
        const accent = category.color ?? "var(--category-default-color)";
        return (
          <Link
            key={category.name}
            href={`${basePath}/category/${toSlug(category.name)}`}
            prefetch={false}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: accent }}
            />
            {labels?.[category.name] ?? category.name}
            <span className="tabular-nums opacity-60">{count}</span>
          </Link>
        );
      })}
    </nav>
  );
}
