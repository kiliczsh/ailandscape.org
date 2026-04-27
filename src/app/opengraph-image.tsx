import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Hex equivalents of design tokens — Satori does not support oklch() or CSS variables.
// #f9f8fb ≈ --background (oklch 0.99 0.005 325)
// #130f19 ≈ --foreground (oklch 0.145 0.008 326)
// #655470 ≈ --muted-foreground (oklch 0.42 0.04 322)
// #2a54d4 ≈ --primary (oklch 0.488 0.243 264)
// #f2eef6 ≈ --category-bar-text (oklch 0.965 0.009 325)
export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#f9f8fb",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: "#130f19",
        }}
      >
        AI Landscape
      </div>
      <div style={{ fontSize: 28, color: "#655470", marginTop: 16 }}>
        The complete map of the AI ecosystem
      </div>
      <div
        style={{
          marginTop: 40,
          padding: "14px 32px",
          background: "#2a54d4",
          color: "#f2eef6",
          fontSize: 22,
          fontWeight: 600,
          borderRadius: 8,
        }}
      >
        Explore the ecosystem →
      </div>
    </div>,
    { ...size },
  );
}
