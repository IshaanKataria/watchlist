import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // TMDB's CDN already serves each image at fixed widths; re-encoding
    // them through Vercel would only spend the image optimisation quota.
    unoptimized: true,
  },
};

export default nextConfig;
