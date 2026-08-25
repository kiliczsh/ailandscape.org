import {
  findItemBySlug,
  getLandscapeData,
  getRelatedItems,
} from "@/data/landscape";
import { toSlug } from "@/lib/slug";

// Served as /tool/{slug}.md via the rewrite in next.config.ts
export const dynamic = "force-static";
export const dynamicParams = false;

const BASE_URL = "https://ailandscape.org";

export function generateStaticParams() {
  const data = getLandscapeData();
  const slugs = new Set<string>();
  for (const category of data.landscape) {
    for (const subcategory of category.subcategories) {
      for (const item of subcategory.items) {
        slugs.add(toSlug(item.name));
      }
    }
  }
  return [...slugs].map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const data = getLandscapeData();
  const found = findItemBySlug(data, slug);
  if (!found) {
    return new Response("Not found", { status: 404 });
  }
  const { item, category, subcategory } = found;
  const categorySlug = toSlug(category.name);
  const related = getRelatedItems(data, item.name, subcategory.name);

  const facts: string[] = [
    `- Category: [${category.name}](${BASE_URL}/category/${categorySlug}) › ${subcategory.name}`,
  ];
  if (item.homepage_url) facts.push(`- Homepage: ${item.homepage_url}`);
  if (item.repo_url) facts.push(`- Repository: ${item.repo_url}`);
  if (item.twitter_url) facts.push(`- X (Twitter): ${item.twitter_url}`);
  if (item.crunchbase) facts.push(`- Crunchbase: ${item.crunchbase}`);
  if (item.tags && item.tags.length > 0)
    facts.push(`- Tags: ${item.tags.join(", ")}`);
  if (item.aliases && item.aliases.length > 0)
    facts.push(`- Also known as: ${item.aliases.join(", ")}`);
  if (item.added_at) facts.push(`- Added to the landscape: ${item.added_at}`);

  const relatedSection =
    related.length > 0
      ? `\n## Similar tools in ${subcategory.name}\n\n${related
          .map((r) => {
            const rSlug = toSlug(r.name);
            const desc = r.description ? `: ${r.description}` : "";
            return `- [${r.name}](${BASE_URL}/tool/${rSlug})${desc}`;
          })
          .join("\n")}\n`
      : "";

  const body = `# ${item.name}

> ${item.description ?? `${item.name} is part of ${subcategory.name} in ${category.name} on AI Landscape.`}

${facts.join("\n")}
${relatedSection}
---

Part of [AI Landscape](${BASE_URL}), an open map of the AI ecosystem. Web page: ${BASE_URL}/tool/${slug} · Index for AI assistants: ${BASE_URL}/llms.txt
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
