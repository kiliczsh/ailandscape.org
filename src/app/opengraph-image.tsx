import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Static hex colors — Satori (OG image generator) does not support CSS variables
export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#fafafa",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ fontSize: 72, fontWeight: 700, color: "#0f172a" }}>
        AI Landscape
      </div>
      <div style={{ fontSize: 28, color: "#6b7280", marginTop: 16 }}>
        The complete map of the AI ecosystem
      </div>
      <div
        style={{
          marginTop: 40,
          padding: "14px 32px",
          background: "#0f172a",
          color: "#ffffff",
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
