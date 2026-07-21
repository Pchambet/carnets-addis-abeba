import Link from 'next/link';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { THEMES, getThemeBySlug } from '@/lib/themes';
import { getLettersForTheme } from '@/lib/jardin';
import InteractiveJourney from '@/components/Reading/InteractiveJourney';

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

  // Load questions for the theme
  let questions = [];
  try {
    const journeyPath = path.join(process.cwd(), 'content/parcours-initiatique.json');
    if (fs.existsSync(journeyPath)) {
      const raw = fs.readFileSync(journeyPath, 'utf8');
      const data = JSON.parse(raw);
      const themeData = data.find((d: any) => d.theme === theme);
      if (themeData) {
        questions = themeData.questions;
      }
    }
  } catch (e) {
    console.error('Error loading journey data', e);
  }

  return (
    <div className="min-h-screen bg-[var(--white)]">
      {/* ── Sas de Décompression (Header immersif) ── */}
      <section className="px-6 md:px-12 pt-32 pb-24 border-b border-[var(--border)] min-h-[50vh] flex flex-col justify-center text-center relative overflow-hidden">
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

      {/* ── Parcours Initiatique Intéractif ── */}
      <section className="px-6 md:px-12 py-24">
        <InteractiveJourney questions={questions} letters={letters} />
      </section>
    </div>
  );
}
