import { getLandscapeData, getRecentlyAdded } from "@/data/landscape";
import { toSlug } from "@/lib/slug";

export const dynamic = "force-static";

const BASE_URL = "https://ailandscape.org";

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export function GET() {
  const data = getLandscapeData();
  const recent = getRecentlyAdded(data, 50);
  const lastBuildDate = new Date().toUTCString();

  const items = recent
    .map(({ item, category, subcategory }) => {
      const slug = toSlug(item.name);
      const link = `${BASE_URL}/tool/${slug}`;
      const pubDate = item.added_at
        ? new Date(item.added_at).toUTCString()
        : lastBuildDate;
      const description = item.description
        ? `${item.description} (${category.name} › ${subcategory.name})`
        : `${category.name} › ${subcategory.name}`;
      return `    <item>
      <title>${escapeXml(item.name)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(category.name)}</category>
      <description>${escapeXml(description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AI Landscape — Recently Added</title>
    <link>${BASE_URL}</link>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>New AI tools added to ailandscape.org</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
