import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — Headshot Photography`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#f6f3ee",
          color: "#17140f",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#a8875a",
            fontFamily: "sans-serif",
          }}
        >
          {`Headshot Photography · ${site.location}`}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, lineHeight: 1, letterSpacing: -2 }}>
            {`${site.name}`}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 34,
              color: "#3a352d",
              fontFamily: "sans-serif",
            }}
          >
            {site.tagline}
          </div>
        </div>
        <div style={{ fontSize: 24, color: "#7a736a", fontFamily: "sans-serif" }}>
          {site.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    { ...size }
  );
}
