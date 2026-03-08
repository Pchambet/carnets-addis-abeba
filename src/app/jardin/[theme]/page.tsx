import Link from 'next/link';
import { notFound } from 'next/navigation';
import { THEMES, getThemeBySlug } from '@/lib/themes';
import { getLettersForTheme } from '@/lib/jardin';

interface PageProps {
  params: Promise<{ theme: string }>;
}

export async function generateStaticParams() {
  try {
    return THEMES.map((t) => ({ theme: t.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { theme } = await params;
  const def = getThemeBySlug(theme);
  if (!def) return { title: 'Thème inconnu' };
  return {
    title: `${def.label} — Le jardin`,
  };
}

export default async function ThemePage({ params }: PageProps) {
  const { theme } = await params;
  const def = getThemeBySlug(theme);
  if (!def) notFound();

  const letters = getLettersForTheme(theme);

  return (
    <div>
      {/* ── Header ── */}
      <section className="px-6 md:px-12 py-12 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/jardin"
            className="caption text-[var(--ochre)] hover:underline inline-block mb-6 transition-all duration-250"
          >
            ← Retour au jardin
          </Link>
          <h1 className="text-3xl md:text-4xl font-[family-name:var(--font-cormorant)] font-light italic text-[var(--ink)] mb-2">
            {def.label}
          </h1>
          <p className="text-[var(--ink-light)] font-[family-name:var(--font-lora)]">
            {def.description}
          </p>
        </div>
      </section>

      {/* ── Liste des lettres ── */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        {letters.length === 0 ? (
          <p className="text-[var(--ink-light)] italic">Aucune lettre pour ce thème.</p>
        ) : (
          <ul>
            {letters.map((letter) => {
              const formattedDate = new Date(letter.date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <li key={letter.id} className="border-b border-[var(--border)] last:border-b-0">
                  <Link
                    href={`/letters/${letter.id}`}
                    className="block py-10 no-underline hover:no-underline group transition-colors duration-250"
                  >
                    <time className="caption text-[var(--ink-light)]" dateTime={letter.date}>
                      {formattedDate}
                    </time>
                    <h2 className="text-xl md:text-2xl font-[family-name:var(--font-cormorant)] font-light text-[var(--ink)] group-hover:text-[var(--ochre)] transition-colors mt-2">
                      {letter.title}
                    </h2>
                    {letter.excerpt && (
                      <p className="text-[var(--ink-light)] font-[family-name:var(--font-lora)] italic mt-2 line-clamp-2">
                        « {letter.excerpt} »
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
