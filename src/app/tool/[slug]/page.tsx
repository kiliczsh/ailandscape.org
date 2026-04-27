import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  findItemBySlug,
  getLandscapeData,
  getRelatedItems,
} from "@/data/landscape";
import { toSlug } from "@/lib/slug";
import { ToolDetail } from "./tool-detail";

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const data = getLandscapeData();
  const slugs: { slug: string }[] = [];
  for (const category of data.landscape) {
    for (const subcategory of category.subcategories) {
      for (const item of subcategory.items) {
        slugs.push({ slug: toSlug(item.name) });
      }
    }
  }
  return slugs;
}

export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getLandscapeData();
  const found = findItemBySlug(data, slug);
  if (!found) {
    return { title: "Tool not found — AI Landscape" };
  }
  const { item, category, subcategory } = found;
  const title = `${item.name} — ${category.name} | AI Landscape`;
  const description =
    item.description ??
    `${item.name} in ${subcategory.name}, part of ${category.name} on the AI Landscape.`;
  return {
    title,
    description,
    alternates: { canonical: `https://ailandscape.org/tool/${slug}` },
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const data = getLandscapeData();
  const found = findItemBySlug(data, slug);
  if (!found) notFound();
  const { item, category, subcategory } = found;
  const related = getRelatedItems(data, item.name, subcategory.name);
  const categoryTotal = category.subcategories.reduce(
    (sum, sub) => sum + sub.items.length,
    0,
  );

  return (
    <ToolDetail
      item={item}
      category={category}
      subcategory={subcategory}
      related={related}
      tags={data.tags}
      categoryTotal={categoryTotal}
    />
  );
}
