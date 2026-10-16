import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No serverActions.bodySizeLimit bump: admin images and order files upload
  // straight from the browser to Supabase Storage (Vercel caps a function
  // request body at 4.5 MB), so action bodies stay well under the 1 MB default.
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
