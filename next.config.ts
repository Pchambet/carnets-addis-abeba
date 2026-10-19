import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pas d'export statique pour que /api/comment-notify (webhook Supabase → email) fonctionne.
  // output: "export" empêche les API routes d'être déployées sur Vercel.

  // Optimiseur Vercel pour les images principales et les vignettes de l'accueil seulement :
  // le plan Hobby inclut 5 000 transformations par mois (au-delà, les images échouent).
  // Galerie et visionneuse servent les miniatures déjà générées (unoptimized).
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2048],
    // Noms de fichiers stables : une transformation par mois au plus
    minimumCacheTTL: 2678400,
  },

  // Exclusion des images lourdes du bundle serverless pour éviter la limite de 250MB
  outputFileTracingExcludes: {
    '*': ['public/images/**/*'],
  },
  // Le titre de la lettre dans l'email de notification est lu depuis le Markdown
  outputFileTracingIncludes: {
    '/api/comment-notify': ['./content/letters/**/*'],
  },

  // Trailing slash pour URLs propres
  trailingSlash: true,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
          // Site privé : ni les pages ni les photos (/images/*) dans les moteurs de recherche
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noimageindex' },
        ],
      },
      {
        // Photos et vidéos : noms non hachés, donc pas d'« immutable », mais plus de revalidation à chaque visite
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=2592000' }],
      },
    ];
  },
};

export default nextConfig;
