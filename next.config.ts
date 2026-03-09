import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pas d'export statique pour que /api/comment-notify (webhook Supabase → email) fonctionne.
  // output: "export" empêche les API routes d'être déployées sur Vercel.

  // next/image sans optimisation (compatible déploiement Vercel standard)
  images: {
    unoptimized: true,
  },

  // Trailing slash pour URLs propres
  trailingSlash: true,
};

export default nextConfig;
