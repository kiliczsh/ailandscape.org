import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryDirectory } from "@/components/landscape/category-directory";
import { LandscapeView } from "@/components/landscape/landscape-view";
import { RecentlyAdded } from "@/components/landscape/recently-added";
import { getLandscapeData, getRecentlyAdded } from "@/data/landscape";
import { ZH_CATEGORIES, ZH_UI } from "@/lib/i18n/zh";
import type { LandscapeData } from "@/types/landscape";

const BASE_URL = "https://ailandscape.org";

function countTools(data: LandscapeData): number {
  return data.landscape.reduce(
    (sum, cat) =>
      sum + cat.subcategories.reduce((s, sub) => s + sub.items.length, 0),
    0,
  );
}

export function generateMetadata(): Metadata {
  return {
    title: ZH_UI.homeTitle,
    description: ZH_UI.homeDescription,
    alternates: {
      canonical: `${BASE_URL}/zh`,
      languages: {
        en: BASE_URL,
        zh: `${BASE_URL}/zh`,
        "x-default": BASE_URL,
      },
    },
    openGraph: {
      title: ZH_UI.homeTitle,
      description: ZH_UI.homeDescription,
      url: `${BASE_URL}/zh`,
      type: "website",
      locale: "zh_CN",
    },
    twitter: {
      card: "summary_large_image",
      title: ZH_UI.homeTitle,
      description: ZH_UI.homeDescription,
    },
  };
}

const ZH_LABELS = Object.fromEntries(
  Object.entries(ZH_CATEGORIES).map(([en, zh]) => [en, zh.name]),
);

export default function ZhHome() {
  const data = getLandscapeData();
  const total = countTools(data);
  const recent = getRecentlyAdded(data, 6);

  return (
    <div lang="zh-CN" className="flex flex-1 flex-col">
      <h1 className="sr-only">
        {ZH_UI.homeH1} — {total} 个工具 · {data.landscape.length} 个类别
      </h1>
      <RecentlyAdded items={recent} />
      <CategoryDirectory data={data} labels={ZH_LABELS} basePath="/zh" />
      <Suspense>
        <LandscapeView data={data} />
      </Suspense>
    </div>
  );
}
