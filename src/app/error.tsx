"use client";

import { Button } from "@/components/ui/button";

export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
      <p className="text-sm font-medium text-foreground">
        Failed to load landscape data
      </p>
      <p className="max-w-sm text-xs text-muted-foreground">
        {error.message ||
          "An unexpected error occurred while loading the data."}
      </p>
      <Button type="button" variant="outline" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
