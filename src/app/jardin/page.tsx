import type { Metadata } from 'next';
import Link from 'next/link';
import { THEMES } from '@/lib/themes';
import { getThemeLetterCounts } from '@/lib/jardin';

export const metadata: Metadata = { title: 'Le jardin' };

export default function JardinPage() {
  const counts = getThemeLetterCounts();

  return (
    <div className="min-h-screen">
      {/* ── Le Porche ── */}
      <section className="px-6 md:px-12 pt-32 pb-24 md:pt-48 md:pb-32 flex flex-col items-center justify-center text-center min-h-[70vh]">
        <h1 className="text-5xl md:text-7xl font-[family-name:var(--font-cormorant)] font-light italic text-[var(--ink)] mb-12 tracking-tight">
          L’Hortus Conclusus
        </h1>
        <p className="text-xl md:text-2xl text-[var(--ink-light)] font-[family-name:var(--font-cormorant)] italic font-light max-w-2xl leading-relaxed">
          «&nbsp;Entrez ici comme on entre en soi-même.&nbsp;»
        </p>
        <p className="mt-8 text-[var(--ink-light)] font-[family-name:var(--font-lora)] max-w-xl mx-auto leading-loose">
          Invitation à la promenade au jardin intérieur. 
          Choisissez une allée, ouvrez vos sens à l’émerveillement en vous interrogeant.
        </p>
        <a href="#allees" className="mt-16 text-[var(--ochre)] opacity-60 hover:opacity-100 no-underline" aria-label="Aller aux allées du jardin">
          ↓
        </a>
      </section>

      {/* ── Les Allées (Navigation organique) ── */}
      <section id="allees" className="max-w-4xl mx-auto px-6 md:px-12 pb-32 scroll-mt-[var(--header-offset)]">
        <div className="flex flex-col gap-16 md:gap-24">
          {THEMES.map((theme, i) => {
            const n = counts[theme.slug] ?? 0;
            if (n === 0) return null;

            // Alternating alignment for organic feel
            const alignment = i % 2 === 0 ? 'md:items-start' : 'md:items-end md:text-right';

            return (
              <div key={theme.slug} className={`flex flex-col ${alignment}`}>
                <Link
                  href={`/jardin/${theme.slug}`}
                  className="group block max-w-xl no-underline"
                >
                  <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-cormorant)] font-light text-[var(--ink)] group-hover:text-[var(--ochre)] transition-colors duration-500 mb-4">
                    {theme.label}
                  </h2>
                  <p className="text-lg text-[var(--ink-light)] font-[family-name:var(--font-lora)] leading-relaxed mb-6">
                    {theme.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-[1px] bg-[var(--ochre)] opacity-40"></span>
                    <span className="caption text-[var(--ochre)] tracking-widest transition-transform duration-300 group-hover:translate-x-2">
                      {n} lettre{n > 1 ? 's' : ''}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
