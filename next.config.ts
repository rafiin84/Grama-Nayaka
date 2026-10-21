import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve images straight from /public: some hosts (e.g. Zoho Catalyst Slate) do not run the /_next/image optimizer.
  images: { unoptimized: true },
};

export default nextConfig;
