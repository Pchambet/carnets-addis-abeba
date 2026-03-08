import type { MetadataRoute } from 'next';
import { getSortedLettersData } from '@/lib/letters';
import { THEMES } from '@/lib/themes';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://carnets-addis-abeba.vercel.app';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/about/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/carte/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/galerie/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/jardin/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  ];

  const jardinPages: MetadataRoute.Sitemap = THEMES.map((t) => ({
    url: `${baseUrl}/jardin/${encodeURIComponent(t.slug)}/`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  let letterPages: MetadataRoute.Sitemap = [];
  try {
    const letters = getSortedLettersData();
    letterPages = letters.map((letter) => ({
      url: `${baseUrl}/letters/${letter.id}/`,
      lastModified: new Date(letter.date),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    }));
  } catch {
    // Ignore if letters cannot be loaded
  }

  return [...staticPages, ...jardinPages, ...letterPages];
}
