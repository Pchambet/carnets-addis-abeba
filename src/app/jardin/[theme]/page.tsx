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
    <div className="min-h-screen bg-[var(--white)]">
      {/* ── Sas de Décompression (Header immersif) ── */}
      <section className="px-6 md:px-12 pt-32 pb-24 border-b border-[var(--border)] min-h-[60vh] flex flex-col justify-center text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <Link
            href="/jardin"
            className="caption text-[var(--ochre)] hover:underline inline-block mb-12 transition-all duration-250 opacity-80"
          >
            ← Retour au jardin clos
          </Link>
          <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-cormorant)] font-light italic text-[var(--ink)] mb-8 tracking-tight">
            {def.label}
          </h1>
          <p className="text-xl md:text-2xl text-[var(--ink-light)] font-[family-name:var(--font-lora)] font-light leading-relaxed italic max-w-2xl mx-auto">
            {def.description}
          </p>
        </div>
        
        {/* Subtle decorative element */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-px h-24 bg-gradient-to-t from-[var(--ochre)] to-transparent opacity-30"></div>
      </section>

      {/* ── Liste contemplative des lettres ── */}
      <section className="max-w-3xl mx-auto px-6 md:px-12 py-24">
        {letters.length === 0 ? (
          <div className="text-center">
            <p className="text-[var(--ink-light)] font-[family-name:var(--font-lora)] italic text-lg">
              Ce chemin est encore vierge.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-16">
            {letters.map((letter) => {
              const formattedDate = new Date(letter.date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <li key={letter.id} className="group relative">
                  <Link
                    href={`/letters/${letter.id}`}
                    className="block no-underline hover:no-underline transition-all duration-500"
                  >
                    <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8 mb-4">
                      <time className="caption text-[var(--ochre)] opacity-80 shrink-0" dateTime={letter.date}>
                        {formattedDate}
                      </time>
                      <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-cormorant)] font-light text-[var(--ink)] group-hover:text-[var(--ochre)] transition-colors">
                        {letter.title}
                      </h2>
                    </div>
                    {letter.excerpt && (
                      <p className="text-[var(--ink-light)] font-[family-name:var(--font-lora)] leading-relaxed italic md:pl-[calc(4rem+2vw)]">
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
