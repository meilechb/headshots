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
  async redirects() {
    // The studio is organised around clients now. Old bookmarks still land somewhere useful.
    return [
      { source: "/about", destination: "/", permanent: true },
      { source: "/admin/inquiries", destination: "/admin/clients?stage=lead", permanent: false },
      { source: "/admin/orders", destination: "/admin/clients", permanent: false },
      { source: "/admin/orders/:path*", destination: "/admin/clients", permanent: false },
      { source: "/admin/galleries/new", destination: "/admin/galleries", permanent: false },
      { source: "/admin/packages", destination: "/admin/pricing", permanent: false },
    ];
  },
};

export default nextConfig;
