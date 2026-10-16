import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Default is 1MB — too small for admin image uploads (up to 5MB,
    // MAX_IMAGE_BYTES) and order attachments (up to 50MB total,
    // MAX_ORDER_TOTAL_BYTES), both submitted via Server Actions. Without
    // this, any upload over 1MB throws "Body exceeded 1 MB limit" and
    // hits the error boundary instead of the intended validation message.
    serverActions: {
      bodySizeLimit: "55mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
