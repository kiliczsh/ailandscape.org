import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemCard } from "@/components/landscape/item-card";
import { findCategoryBySlug, getLandscapeData } from "@/data/landscape";
import { toSlug } from "@/lib/slug";
import { humanizeGroup, safeJsonLd } from "@/lib/utils";
import type { Category } from "@/types/landscape";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

function countItems(category: Category): number {
  return category.subcategories.reduce((sum, sub) => sum + sub.items.length, 0);
}

function categoryIntro(category: Category): string {
  if (category.intro) return category.intro;
  const subs = category.subcategories.map((s) => s.name).join(", ");
  return `${category.name} on AI Landscape covers ${countItems(category)} tools across ${category.subcategories.length} subcategories: ${subs}. Browse, compare, and discover what fits your stack.`;
}

export async function generateStaticParams() {
  const data = getLandscapeData();
  return data.landscape.map((category) => ({ slug: toSlug(category.name) }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getLandscapeData();
  const category = findCategoryBySlug(data, slug);
  if (!category) {
    return { title: "Category not found — AI Landscape" };
  }
  const title = `${category.name} — AI Landscape`;
  const description =
    category.intro ??
    `Browse ${countItems(category)} ${category.name.toLowerCase()} on AI Landscape — categorized, tagged, and curated.`;
  return {
    title,
    description,
    alternates: { canonical: `https://ailandscape.org/category/${slug}` },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const data = getLandscapeData();
  const category = findCategoryBySlug(data, slug);
  if (!category) notFound();

  const itemCount = countItems(category);
  const intro = categoryIntro(category);
  const accent = category.color ?? "var(--category-default-color)";

  const itemList = category.subcategories.flatMap((sub) =>
    sub.items.map((item) => ({
      "@type": "ListItem" as const,
      name: item.name,
      url: `https://ailandscape.org/tool/${toSlug(item.name)}`,
    })),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} — AI Landscape`,
    description: intro,
    url: `https://ailandscape.org/category/${slug}`,
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
          name: category.name,
          item: `https://ailandscape.org/category/${slug}`,
        },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: itemList.length,
      itemListElement: itemList.map((entry, idx) => ({
        ...entry,
        position: idx + 1,
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
          <li className="text-foreground">{category.name}</li>
        </ol>
      </nav>

      <header className="mb-8 border-l-4 pl-4" style={{ borderColor: accent }}>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {humanizeGroup(category.group)}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {category.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {itemCount} {itemCount === 1 ? "tool" : "tools"} ·{" "}
          {category.subcategories.length}{" "}
          {category.subcategories.length === 1
            ? "subcategory"
            : "subcategories"}
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/90 sm:text-base">
          {intro}
        </p>
      </header>

      {category.subcategories.length > 1 && (
        <nav
          aria-label="Jump to subcategory"
          className="mb-6 flex flex-wrap gap-1.5"
        >
          {category.subcategories.map((sub) => (
            <a
              key={sub.name}
              href={`#${toSlug(sub.name)}`}
              className="rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              {sub.name}
              <span className="ml-1.5 tabular-nums opacity-60">
                {sub.items.length}
              </span>
            </a>
          ))}
        </nav>
      )}

      <div className="space-y-10">
        {category.subcategories.map((sub) => (
          <section
            key={sub.name}
            id={toSlug(sub.name)}
            aria-labelledby={`sub-${toSlug(sub.name)}-h`}
          >
            <h2
              id={`sub-${toSlug(sub.name)}-h`}
              className="mb-3 flex items-baseline gap-2 text-xl font-semibold"
            >
              {sub.name}
              <span className="text-xs font-normal tabular-nums text-muted-foreground">
                {sub.items.length}
              </span>
            </h2>
            <div className="flex flex-wrap gap-3">
              {sub.items.map((item) => (
                <ItemCard
                  key={item.name}
                  item={item}
                  viewMode="grid"
                  categoryColor={accent}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-sm">
        <Link
          href={`/?category=${slug}`}
          className="text-foreground hover:underline"
        >
          ← Back to the full landscape
        </Link>
        <Link
          href="/submit"
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          Suggest a tool for {category.name} →
        </Link>
      </div>
    </div>
  );
}
