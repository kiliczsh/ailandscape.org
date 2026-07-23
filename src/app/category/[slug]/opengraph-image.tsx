import { ImageResponse } from "next/og";
import { findCategoryBySlug, getLandscapeData } from "@/data/landscape";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AI Landscape category";
export const dynamic = "force-dynamic";

export default async function CategoryOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = getLandscapeData();
  const category = findCategoryBySlug(data, slug);

  const name = category?.name ?? "Category";
  const itemCount =
    category?.subcategories.reduce((sum, sub) => sum + sub.items.length, 0) ??
    0;
  const subcategoryNames =
    category?.subcategories.slice(0, 5).map((s) => s.name) ?? [];

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#f9f8fb",
        flexDirection: "column",
        padding: "60px 70px",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 16,
          height: "100%",
          background: "#2a54d4",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 22,
          color: "#655470",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        AI Landscape · Category
      </div>

      <div
        style={{
          marginTop: "auto",
          fontSize: 110,
          fontWeight: 800,
          color: "#130f19",
          lineHeight: 1.0,
          letterSpacing: -3,
        }}
      >
        {name}
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 22,
          fontSize: 32,
          color: "#3a2f44",
          fontWeight: 500,
        }}
      >
        {itemCount} {itemCount === 1 ? "tool" : "tools"}
        {category
          ? ` across ${category.subcategories.length} subcategories`
          : ""}
      </div>

      {subcategoryNames.length > 0 && (
        <div
          style={{
            marginTop: 22,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {subcategoryNames.map((sub) => (
            <span
              key={sub}
              style={{
                background: "#ede8f0",
                color: "#3a2f44",
                padding: "8px 16px",
                borderRadius: 999,
                fontSize: 20,
                fontWeight: 500,
              }}
            >
              {sub}
            </span>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: 24,
          fontSize: 18,
          color: "#a99cb0",
        }}
      >
        ailandscape.org
      </div>
    </div>,
    { ...size },
  );
}
