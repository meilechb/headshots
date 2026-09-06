import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Public portfolio images live in the public Vercel Blob store.
    // Private gallery photos are streamed by /api/photo/[id] and rendered
    // with `unoptimized`, since the optimizer cannot carry the viewer's cookie.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
