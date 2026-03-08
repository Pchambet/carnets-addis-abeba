import type { Metadata } from 'next';
import Link from 'next/link';
import { Cormorant_Garamond, Lora, Noto_Sans_Ethiopic, Sacramento } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
});

const ethiopic = Noto_Sans_Ethiopic({
  subsets: ['ethiopic'],
  weight: ['300', '400', '700'],
  variable: '--font-ethiopic',
  display: 'swap',
});

const signature = Sacramento({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-signature',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'La Parenthèse du Dimanche Soir',
  description: 'Nouvelles hebdomadaires depuis la nouvelle fleur — Lettres de Claire depuis Addis-Abeba.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${lora.variable} ${ethiopic.variable} ${signature.variable}`}>
      <body className="min-h-screen flex flex-col">

        {/* ── Header ── */}
        <header className="py-8 px-6 md:px-12 border-b border-[var(--border)]">
          <div className="max-w-4xl mx-auto flex justify-between items-baseline gap-6 flex-wrap">
            <Link href="/" className="no-underline hover:no-underline">
              <h1 className="text-2xl md:text-3xl font-light mt-1 text-[var(--ink)] leading-tight">
                La Parenthèse<br />
                <em className="text-[var(--ochre)]">du dimanche soir</em>
              </h1>
            </Link>
            <nav className="flex gap-8 caption text-[var(--ink-light)]">
              <Link href="/">Lettres</Link>
              <Link href="/galerie">Galerie</Link>
              <Link href="/about">À propos</Link>
            </nav>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="flex-1">
          {children}
        </main>

        {/* ── Footer ── */}
        <footer className="mt-32 py-16 border-t border-[var(--border)] text-center">
          <div className="flex justify-center gap-3 mb-6">
            {/* Tibeb-inspired triple dot motif */}
            <div className="w-2 h-2 rotate-45 bg-[var(--ochre)] opacity-60"></div>
            <div className="w-2 h-2 rotate-45 bg-[var(--red)] opacity-60"></div>
            <div className="w-2 h-2 rotate-45 bg-[var(--gold)] opacity-60"></div>
          </div>
          <p className="caption text-[var(--ink-light)]">
            Un carnet de Claire · Addis-Abeba · {new Date().getFullYear()}
          </p>
        </footer>

      </body>
    </html>
  );
}
