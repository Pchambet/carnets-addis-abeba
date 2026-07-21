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
    slug: "desert-et-grace",
    label: "Le Désert et la Grâce",
    description: "Le silence, le dépouillement, la prière intime, et l'irruption soudaine de Dieu.",
  },
  {
    slug: "lien-a-l-autre",
    label: "Le Lien à l'Autre",
    description: "Les visages, l'hospitalité éthiopienne, le rattachement social et amoureux.",
  },
  {
    slug: "epreuve-deracinement",
    label: "L'Épreuve du Déracinement",
    description: "Le choc de l'imprévu, l'apprentissage de la vulnérabilité : désapprendre à faire.",
  },
  {
    slug: "visage-du-christ",
    label: "Le Visage du Christ",
    description: "La charité incarnée. Les œuvres de miséricorde auprès des pauvres et des mourants.",
  },
  {
    slug: "poetique-du-quotidien",
    label: "Poétique du Quotidien",
    description: "La contemplation de la beauté, les semences du Verbe, et les miracles ordinaires.",
  },
];

export function getThemeBySlug(slug: string): ThemeDef | undefined {
  return THEMES.find((t) => t.slug === slug);
}
