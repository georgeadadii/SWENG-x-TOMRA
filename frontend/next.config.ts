import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  swcMinify: true, // Ensure SWC is enabled
  experimental: {
    forceSwcTransforms: true, // Force Next.js to use SWC for transforms
  },
};

export default nextConfig;
