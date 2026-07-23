import { ImageResponse } from "next/og";
import { findItemBySlug, getLandscapeData } from "@/data/landscape";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AI Landscape tool";
export const dynamic = "force-dynamic";

export default async function ToolOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = getLandscapeData();
  const found = findItemBySlug(data, slug);

  const name = found?.item.name ?? "Tool";
  const categoryName = found?.category.name ?? "AI Landscape";
  const subcategoryName = found?.subcategory.name ?? "";
  const description = found?.item.description ?? "";

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
        AI Landscape
      </div>

      <div
        style={{
          marginTop: "auto",
          fontSize: 96,
          fontWeight: 800,
          color: "#130f19",
          lineHeight: 1.05,
          letterSpacing: -2,
        }}
      >
        {name}
      </div>

      {description && (
        <div
          style={{
            marginTop: 18,
            fontSize: 28,
            color: "#3a2f44",
            lineHeight: 1.3,
            maxWidth: 980,
          }}
        >
          {description}
        </div>
      )}

      <div
        style={{
          marginTop: 28,
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 22,
          color: "#655470",
          fontWeight: 500,
        }}
      >
        <span
          style={{
            background: "#2a54d4",
            color: "#f2eef6",
            padding: "6px 14px",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 20,
          }}
        >
          {categoryName}
        </span>
        {subcategoryName && (
          <>
            <span style={{ color: "#a99cb0" }}>›</span>
            <span>{subcategoryName}</span>
          </>
        )}
      </div>

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
