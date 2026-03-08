import Link from 'next/link';
import { THEMES } from '@/lib/themes';
import { getThemeLetterCounts } from '@/lib/jardin';

export default function JardinPage() {
  const counts = getThemeLetterCounts();

  return (
    <div>
      {/* ── Header ── */}
      <section className="px-6 md:px-12 py-20 border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto">
          <p className="caption text-[var(--ochre)] mb-4">Carnets d&apos;Addis-Abéba</p>
          <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-cormorant)] font-light italic text-[var(--ink)] mb-6 tracking-tight">
            Le jardin
          </h1>
          <p className="text-lg text-[var(--ink-light)] font-[family-name:var(--font-lora)] leading-relaxed italic">
            Une autre façon de parcourir les lettres.
          </p>
          <p className="mt-4 text-[var(--ink-light)] font-[family-name:var(--font-lora)] leading-relaxed">
            Parcourir les lettres autrement, selon ce qui vous attire.
          </p>
        </div>
      </section>

      {/* ── Grille des thèmes ── */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((theme) => {
            const n = counts[theme.slug] ?? 0;
            if (n === 0) return null;

            return (
              <Link
                key={theme.slug}
                href={`/jardin/${theme.slug}`}
                className="group no-underline hover:no-underline block p-6 rounded-lg border border-[var(--border)] bg-[var(--white)]/50 hover:border-[var(--ochre)] hover:bg-[var(--white)]/80 transition-all duration-300"
              >
                <h2 className="text-xl font-[family-name:var(--font-cormorant)] font-light text-[var(--ink)] group-hover:text-[var(--ochre)] transition-colors mb-2">
                  {theme.label}
                </h2>
                <p className="text-sm text-[var(--ink-light)] font-[family-name:var(--font-lora)] leading-relaxed mb-4 line-clamp-2">
                  {theme.description}
                </p>
                <span className="caption text-[var(--ochre)]">
                  {n} lettre{n > 1 ? 's' : ''} →
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
