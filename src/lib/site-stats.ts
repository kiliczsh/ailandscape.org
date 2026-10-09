import { getLandscapeData } from "@/data/landscape";

export interface SiteStats {
  total: number;
  categories: number;
  /** Total rounded down to the hundred, e.g. 802 -> 800 */
  rounded: number;
  /** Marketing label for SEO text, e.g. "800+" */
  label: string;
}

/** Counts derived from the YAML data so SEO copy never drifts from inventory. */
export function getSiteStats(): SiteStats {
  const data = getLandscapeData();
  const total = data.landscape.reduce(
    (sum, cat) =>
      sum + cat.subcategories.reduce((s, sub) => s + sub.items.length, 0),
    0,
  );
  const rounded = Math.floor(total / 100) * 100;
  return {
    total,
    categories: data.landscape.length,
    rounded,
    label: `${rounded}+`,
  };
}
