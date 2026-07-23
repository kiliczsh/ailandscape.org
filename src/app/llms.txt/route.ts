import { getLandscapeData, getTagsWithItems } from "@/data/landscape";
import { toSlug } from "@/lib/slug";

export const dynamic = "force-static";

const BASE_URL = "https://ailandscape.org";

function countItems(data: ReturnType<typeof getLandscapeData>): number {
  return data.landscape.reduce(
    (sum, category) =>
      sum + category.subcategories.reduce((s, sub) => s + sub.items.length, 0),
    0,
  );
}

export function GET(): Response {
  const data = getLandscapeData();
  const totalItems = countItems(data);
  const tags = getTagsWithItems(data);

  const categoryLines = data.landscape.map((category) => {
    const slug = toSlug(category.name);
    const count = category.subcategories.reduce(
      (sum, sub) => sum + sub.items.length,
      0,
    );
    const subs = category.subcategories.map((sub) => sub.name).join(", ");
    return `- [${category.name}](${BASE_URL}/category/${slug}): ${count} tools — ${subs}`;
  });

  const tagLines = tags.map((tag) => {
    const label = data.tags[tag]?.label ?? tag;
    return `- [${label}](${BASE_URL}/tag/${tag})`;
  });

  const body = `# AI Landscape

> An open, community-curated map of the AI ecosystem: ${totalItems} tools, models, labs, and platforms organized into ${data.landscape.length} categories with tags. Every tool has its own page with description, links, and related tools. Content is free to browse, cite, and reference; the data is maintained as YAML on GitHub.

Site structure: the landscape overview is on the homepage, each category has a page at /category/{slug}, each tool at /tool/{slug}, and each tag at /tag/{slug}. All pages are static HTML.

## Resources

- [About](${BASE_URL}/about): what AI Landscape is and how it is maintained
- [Submit a tool](${BASE_URL}/submit): how to add or update an entry
- [RSS feed](${BASE_URL}/feed.xml): recently added tools
- [Tool count](${BASE_URL}/count.json): live counts as JSON
- [Sitemap](${BASE_URL}/sitemap.xml): all pages
- [Source data on GitHub](https://github.com/kiliczsh/ailandscape.org): YAML files behind the site

## Categories

${categoryLines.join("\n")}

## Tags

${tagLines.join("\n")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
