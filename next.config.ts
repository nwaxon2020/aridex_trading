import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [], // Add domains if you use Next.js Image component
  },
};

export default nextConfig;