import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@repo/db"],
  experimental: {
    esmExternals: true
  }
};

export default nextConfig;
