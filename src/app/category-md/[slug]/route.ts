import { findCategoryBySlug, getLandscapeData } from "@/data/landscape";
import { toSlug } from "@/lib/slug";

// Served as /category/{slug}.md via the rewrite in next.config.ts
export const dynamic = "force-static";
export const dynamicParams = false;

const BASE_URL = "https://ailandscape.org";

export function generateStaticParams() {
  const data = getLandscapeData();
  return data.landscape.map((category) => ({ slug: toSlug(category.name) }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const data = getLandscapeData();
  const category = findCategoryBySlug(data, slug);
  if (!category) {
    return new Response("Not found", { status: 404 });
  }
  const count = category.subcategories.reduce(
    (sum, sub) => sum + sub.items.length,
    0,
  );

  const sections = category.subcategories.map((sub) => {
    const lines = sub.items.map((item) => {
      const itemSlug = toSlug(item.name);
      const desc = item.description ? `: ${item.description}` : "";
      return `- [${item.name}](${BASE_URL}/tool/${itemSlug})${desc}`;
    });
    return `## ${sub.name}\n\n${lines.join("\n")}`;
  });

  const body = `# ${category.name}

> ${category.intro ?? `${category.name} on AI Landscape.`}

${count} tools in ${category.subcategories.length} subcategories. Web page: ${BASE_URL}/category/${slug} · Each tool also has a markdown version at /tool/{slug}.md

${sections.join("\n\n")}

---

Part of [AI Landscape](${BASE_URL}), an open map of the AI ecosystem. Index for AI assistants: ${BASE_URL}/llms.txt
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
