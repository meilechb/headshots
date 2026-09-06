import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const nextConfig: NextConfig = {
  images: {
    // Public portfolio objects and short-lived signed gallery URLs both live
    // under /storage/v1/object/. `search` is omitted on purpose so the signed
    // URL token query string is accepted.
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/**",
      },
    ],
    qualities: [60, 75, 90],
  },
};

export default nextConfig;
