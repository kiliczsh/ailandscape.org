import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  findItemBySlug,
  getLandscapeData,
  getRelatedItems,
} from "@/data/landscape";
import { toSlug } from "@/lib/slug";
import { safeJsonLd } from "@/lib/utils";
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
    openGraph: {
      title,
      description,
      type: "article",
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const data = getLandscapeData();
  const found = findItemBySlug(data, slug);
  if (!found) notFound();
  const { item, category, subcategory } = found;
  const related = getRelatedItems(data, item.name, subcategory.name);
  const categorySlug = toSlug(category.name);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: item.name,
    description:
      item.description ??
      `${item.name} in ${subcategory.name}, part of ${category.name} on the AI Landscape.`,
    url: `https://ailandscape.org/tool/${slug}`,
    applicationCategory: category.name,
    ...(item.homepage_url ? { sameAs: [item.homepage_url] } : {}),
    ...(item.logo
      ? { image: `https://ailandscape.org/logos/${item.logo}` }
      : {}),
    ...(item.tags && item.tags.length > 0
      ? { keywords: item.tags.join(", ") }
      : {}),
    isPartOf: {
      "@type": "CollectionPage",
      name: `${category.name} — AI Landscape`,
      url: `https://ailandscape.org/category/${categorySlug}`,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "AI Landscape",
        item: "https://ailandscape.org",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `https://ailandscape.org/category/${categorySlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: item.name,
        item: `https://ailandscape.org/tool/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: safeJsonLd escapes </script>
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: safeJsonLd escapes </script>
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <ToolDetail
        item={item}
        category={category}
        subcategory={subcategory}
        related={related}
        tags={data.tags}
      />
    </>
  );
}
