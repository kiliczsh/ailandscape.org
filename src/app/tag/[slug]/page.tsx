import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemCard } from "@/components/landscape/item-card";
import {
  type FoundItem,
  getItemsByTag,
  getLandscapeData,
  getTagsWithItems,
} from "@/data/landscape";
import { toSlug } from "@/lib/slug";
import { safeJsonLd } from "@/lib/utils";
import type { Category } from "@/types/landscape";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const data = getLandscapeData();
  return getTagsWithItems(data).map((tag) => ({ slug: tag }));
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getLandscapeData();
  const meta = data.tags[slug];
  const items = getItemsByTag(data, slug);
  if (!meta || items.length === 0) {
    return { title: "Tag not found — AI Landscape" };
  }
  const label = meta.label;
  const title = `${label} AI Tools — AI Landscape`;
  const description = `${items.length} ${label.toLowerCase()} ${
    items.length === 1 ? "tool" : "tools"
  } on AI Landscape — categorized, tagged, and curated across the AI ecosystem.`;
  return {
    title,
    description,
    alternates: { canonical: `https://ailandscape.org/tag/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
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

function groupByCategory(items: FoundItem[]): [Category, FoundItem[]][] {
  const groups = new Map<Category, FoundItem[]>();
  for (const found of items) {
    const list = groups.get(found.category) ?? [];
    list.push(found);
    groups.set(found.category, list);
  }
  return [...groups.entries()].sort((a, b) =>
    a[0].name.localeCompare(b[0].name),
  );
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const data = getLandscapeData();
  const meta = data.tags[slug];
  const items = getItemsByTag(data, slug);
  if (!meta || items.length === 0) notFound();

  const label = meta.label;
  const accent = meta.color ?? "var(--category-default-color)";
  const groups = groupByCategory(items);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${label} AI Tools — AI Landscape`,
    description: `${items.length} ${label.toLowerCase()} tools on AI Landscape.`,
    url: `https://ailandscape.org/tag/${slug}`,
    breadcrumb: {
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
          name: label,
          item: `https://ailandscape.org/tag/${slug}`,
        },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((found, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: found.item.name,
        url: `https://ailandscape.org/tool/${toSlug(found.item.name)}`,
      })),
    },
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-10">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: safeJsonLd escapes </script>
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <nav
        aria-label="Breadcrumb"
        className="mb-4 text-xs text-muted-foreground"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground hover:underline">
              AI Landscape
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{label}</li>
        </ol>
      </nav>

      <header className="mb-8 border-l-4 pl-4" style={{ borderColor: accent }}>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Tag
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {label}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "tool" : "tools"} ·{" "}
          {groups.length} {groups.length === 1 ? "category" : "categories"}
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/90 sm:text-base">
          Every tool tagged “{label}” on the AI Landscape, grouped by category.
          Browse, compare, and discover what fits your stack.
        </p>
      </header>

      <div className="space-y-10">
        {groups.map(([category, found]) => (
          <section
            key={category.name}
            aria-labelledby={`tag-${toSlug(category.name)}-h`}
          >
            <h2
              id={`tag-${toSlug(category.name)}-h`}
              className="mb-3 flex items-baseline gap-2 text-xl font-semibold"
            >
              <Link
                href={`/category/${toSlug(category.name)}`}
                className="hover:underline"
              >
                {category.name}
              </Link>
              <span className="text-xs font-normal tabular-nums text-muted-foreground">
                {found.length}
              </span>
            </h2>
            <div className="flex flex-wrap gap-3">
              {found.map(({ item, category: itemCategory }) => (
                <ItemCard
                  key={item.name}
                  item={item}
                  viewMode="grid"
                  categoryColor={
                    itemCategory.color ?? "var(--category-default-color)"
                  }
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-sm">
        <Link href="/" className="text-foreground hover:underline">
          ← Back to the full landscape
        </Link>
        <Link
          href="/submit"
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          Suggest a tool →
        </Link>
      </div>
    </div>
  );
}
