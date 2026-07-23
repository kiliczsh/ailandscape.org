import { getLandscapeData } from "@/data/landscape";

export const dynamic = "force-static";

export function GET() {
  const data = getLandscapeData();
  const total = data.landscape.reduce(
    (sum, cat) =>
      sum + cat.subcategories.reduce((s, sub) => s + sub.items.length, 0),
    0,
  );
  const categories = data.landscape.length;

  return Response.json(
    {
      total,
      categories,
      schemaVersion: 1,
      label: "tools",
      message: `${total}`,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    },
  );
}
