import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — generates pure HTML/CSS/JS without any serverless functions.
  // This removes the Vercel "max function size" constraint entirely,
  // and deploys images via the static CDN instead.
  output: "export",

  // next/image can't use the built-in optimization with static export.
  // Vercel's CDN and modern browsers handle this natively.
  images: {
    unoptimized: true,
  },

  // Trailing slash for clean static paths
  trailingSlash: true,
};

export default nextConfig;
