import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pas d'export statique pour que /api/comment-notify (webhook Supabase → email) fonctionne.
  // output: "export" empêche les API routes d'être déployées sur Vercel.

  // next/image sans optimisation (compatible déploiement Vercel standard)
  images: {
    unoptimized: true,
  },

  // Exclusion des images lourdes du bundle serverless pour éviter la limite de 250MB
  outputFileTracingExcludes: {
    '*': ['public/images/**/*'],
  },

  // Trailing slash pour URLs propres
  trailingSlash: true,
};

export default nextConfig;
