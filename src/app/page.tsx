import { Suspense } from "react";
import { LandscapeView } from "@/components/landscape/landscape-view";
import { Skeleton } from "@/components/ui/skeleton";
import { getLandscapeData } from "@/data/landscape";

// Widths approximate the actual FilterBar group pill labels (unique values = stable keys)
const PILL_WIDTHS = [36, 44, 62, 104, 77, 68, 66];

// Item counts per skeleton row — varies to look realistic
const SKELETON_ROWS = [
  { id: "a", count: 14 },
  { id: "b", count: 9 },
  { id: "c", count: 11 },
  { id: "d", count: 7 },
];

function LandscapeSkeleton() {
  return (
    <div className="flex flex-col flex-1" aria-hidden="true">
      {/* Filter bar */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <div className="flex gap-1 overflow-hidden">
          {PILL_WIDTHS.map((w) => (
            <Skeleton
              key={w}
              className="h-7 shrink-0 rounded-md"
              style={{ width: w }}
            />
          ))}
        </div>
        <div className="ml-auto flex shrink-0 gap-1">
          <Skeleton className="h-7 w-7" />
          <Skeleton className="h-7 w-7" />
        </div>
      </div>

      {/* Category rows */}
      {SKELETON_ROWS.map(({ id, count }) => (
        <div
          key={id}
          className="flex flex-col border-b border-border last:border-b-0 sm:flex-row"
        >
          {/* Mobile: horizontal header bar */}
          <Skeleton className="h-10 w-full rounded-none sm:hidden" />
          {/* Item grid — desktop only to keep mobile uncluttered */}
          <div className="hidden flex-1 flex-wrap gap-2 p-3 sm:flex">
            {Array.from({ length: count }).map((_, j) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton never reorders
              <Skeleton key={j} className="h-[58px] w-[80px]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LandscapeSkeleton />}>
      <LandscapeView data={getLandscapeData()} />
    </Suspense>
  );
}
