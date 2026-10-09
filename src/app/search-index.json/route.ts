import { getLandscapeData } from "@/data/landscape";

export const dynamic = "force-static";

/**
 * Compact search index for the global command palette. Fetched lazily on
 * first open so tool/category pages don't ship the full landscape payload.
 * Shape: categories = names; items = [name, subcategory, categoryIndex, aliases?].
 */
export function GET() {
  const data = getLandscapeData();
  const categories = data.landscape.map((cat) => cat.name);
  const items: (
    | [string, string, number]
    | [string, string, number, string[]]
  )[] = [];
  data.landscape.forEach((cat, ci) => {
    for (const sub of cat.subcategories) {
      for (const item of sub.items) {
        items.push(
          item.aliases?.length
            ? [item.name, sub.name, ci, item.aliases]
            : [item.name, sub.name, ci],
        );
      }
    }
  });

  return Response.json(
    { categories, items },
    {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    },
  );
}
