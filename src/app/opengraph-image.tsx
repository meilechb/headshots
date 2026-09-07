import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name}, headshot photographer in Rockland County, NY`;
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
          background: "#0d0d0e",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#9a9a9a",
          }}
        >
          {`Headshot Photography · ${site.location}`}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 96,
              lineHeight: 1,
              letterSpacing: -2,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {`${site.name}`}
          </div>
          <div style={{ marginTop: 28, fontSize: 34, color: "#b0b0b0" }}>
            {site.tagline}
          </div>
        </div>
        <div style={{ fontSize: 24, color: "#6a6a6a" }}>
          {site.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    { ...size }
  );
}
