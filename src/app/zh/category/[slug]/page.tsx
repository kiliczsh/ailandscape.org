import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemCard } from "@/components/landscape/item-card";
import { findCategoryBySlug, getLandscapeData } from "@/data/landscape";
import { ZH_CATEGORIES, ZH_GROUPS, ZH_UI } from "@/lib/i18n/zh";
import { toSlug } from "@/lib/slug";
import { safeJsonLd } from "@/lib/utils";
import type { Category } from "@/types/landscape";

interface ZhCategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

const BASE_URL = "https://ailandscape.org";

function countItems(category: Category): number {
  return category.subcategories.reduce((sum, sub) => sum + sub.items.length, 0);
}

export async function generateStaticParams() {
  const data = getLandscapeData();
  return data.landscape.map((category) => ({ slug: toSlug(category.name) }));
}

export async function generateMetadata({
  params,
}: ZhCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getLandscapeData();
  const category = findCategoryBySlug(data, slug);
  if (!category) {
    return { title: "未找到该类别 — AI 全景图" };
  }
  const zh = ZH_CATEGORIES[category.name];
  const zhName = zh?.name ?? category.name;
  const title = `${zhName}（${category.name}）— ${countItems(category)} 个 AI 工具 | AI 全景图`;
  const description = zh?.intro ?? category.intro ?? "";
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/zh/category/${slug}`,
      languages: {
        en: `${BASE_URL}/category/${slug}`,
        zh: `${BASE_URL}/zh/category/${slug}`,
        "x-default": `${BASE_URL}/category/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/zh/category/${slug}`,
      type: "website",
      locale: "zh_CN",
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

export default async function ZhCategoryPage({ params }: ZhCategoryPageProps) {
  const { slug } = await params;
  const data = getLandscapeData();
  const category = findCategoryBySlug(data, slug);
  if (!category) notFound();

  const zh = ZH_CATEGORIES[category.name];
  const zhName = zh?.name ?? category.name;
  const intro = zh?.intro ?? category.intro ?? "";
  const itemCount = countItems(category);
  const accent = category.color ?? "var(--category-default-color)";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${zhName} — AI 全景图`,
    description: intro,
    url: `${BASE_URL}/zh/category/${slug}`,
    inLanguage: "zh-CN",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: ZH_UI.breadcrumbHome,
          item: `${BASE_URL}/zh`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: zhName,
          item: `${BASE_URL}/zh/category/${slug}`,
        },
      ],
    },
  };

  return (
    <div
      lang="zh-CN"
      className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-10"
    >
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
            <Link href="/zh" className="hover:text-foreground hover:underline">
              {ZH_UI.breadcrumbHome}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{zhName}</li>
        </ol>
      </nav>

      <header className="mb-8 border-l-4 pl-4" style={{ borderColor: accent }}>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {category.group ? (ZH_GROUPS[category.group] ?? category.group) : ""}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {zhName}
          <span className="ml-2 text-lg font-normal text-muted-foreground">
            {category.name}
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {itemCount}
          {ZH_UI.tools} · {category.subcategories.length}
          {ZH_UI.subcategories}
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/90 sm:text-base">
          {intro}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          <Link
            href={`/category/${slug}`}
            className="hover:text-foreground hover:underline"
          >
            {ZH_UI.viewEnglish} →
          </Link>
        </p>
      </header>

      <div className="space-y-10">
        {category.subcategories.map((sub) => (
          <section key={sub.name} id={toSlug(sub.name)}>
            <h2 className="mb-3 flex items-baseline gap-2 text-xl font-semibold">
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
        <Link href="/zh" className="text-foreground hover:underline">
          {ZH_UI.backToLandscape}
        </Link>
        <Link
          href="/submit"
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          {ZH_UI.suggestTool} →
        </Link>
      </div>
    </div>
  );
}
