/**
 * Thèmes du jardin — exploration thématique des lettres.
 * Les slugs correspondent aux clés de content/letter-themes.json
 */
export interface ThemeDef {
  slug: string;
  label: string;
  description: string;
}

export const THEMES: ThemeDef[] = [
  {
    slug: "spiritualité",
    label: "Spiritualité",
    description: "Prière, messe, fêtes liturgiques, Taizé.",
  },
  {
    slug: "mission",
    label: "Mission",
    description: "Les sœurs, les enfants, le centre, l’école.",
  },
  {
    slug: "solidarité",
    label: "Solidarité",
    description: "Partage, générosité, entraide.",
  },
  {
    slug: "culture",
    label: "Culture",
    description: "Traditions éthiopiennes, arts, coutumes.",
  },
  {
    slug: "rencontres",
    label: "Rencontres",
    description: "Amis, familles, ailleurs.",
  },
];

export function getThemeBySlug(slug: string): ThemeDef | undefined {
  return THEMES.find((t) => t.slug === slug);
}
