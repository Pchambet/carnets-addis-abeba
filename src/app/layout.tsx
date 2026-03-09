import type { Metadata } from 'next';
import Link from 'next/link';
import { Cormorant_Garamond, Lora, Noto_Sans_Ethiopic, Sacramento } from 'next/font/google';
import './globals.css';
import PasswordGate from '@/components/PasswordGate';

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://carnets-addis-abeba.vercel.app';

export const metadata: Metadata = {
  title: {
    default: 'La Parenthèse du Dimanche Soir',
    template: '%s — La Parenthèse du dimanche soir',
  },
  description: 'Une lettre par semaine depuis Addis-Abéba — Nouvelles hebdomadaires d\'un voyage en Éthiopie.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'La Parenthèse du dimanche soir',
    images: [{ url: '/images/home-hero.jpg', width: 2000, height: 1500, alt: 'Addis-Abéba — La Nouvelle Fleur' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${lora.variable} ${ethiopic.variable} ${signature.variable}`}>
      <body className="min-h-screen flex flex-col">
        <PasswordGate>
        {/* Lien d'évitement — accessibilité clavier */}
        <a
          href="#main-content"
          className="skip-link"
        >
          Aller au contenu
        </a>

        {/* ── Header ── */}
        <header className="py-8 px-6 md:px-12 border-b border-[var(--border)]">
          <div className="max-w-4xl mx-auto flex justify-between items-baseline gap-6 flex-wrap">
            <Link href="/" className="no-underline hover:no-underline block transition-opacity duration-250 hover:opacity-80">
              <h1 className="text-2xl md:text-3xl font-normal sm:font-light mt-1 text-[var(--ink)] leading-tight">
                La Parenthèse<br />
                <em className="text-[var(--ochre)]">du dimanche soir</em>
              </h1>
            </Link>
            <nav className="flex gap-5 sm:gap-8 caption text-[var(--ink-light)] flex-wrap" aria-label="Navigation principale">
              <Link href="/" className="transition-colors duration-250 hover:text-[var(--ochre)]">Lettres</Link>
              <Link href="/jardin" className="transition-colors duration-250 hover:text-[var(--ochre)]">Jardin</Link>
              <Link href="/carte" className="transition-colors duration-250 hover:text-[var(--ochre)]">Carte</Link>
              <Link href="/galerie" className="transition-colors duration-250 hover:text-[var(--ochre)]">Galerie</Link>
              <Link href="/about" className="transition-colors duration-250 hover:text-[var(--ochre)]">À propos</Link>
            </nav>
          </div>
        </header>

        {/* ── Main ── */}
        <main id="main-content" className="flex-1" tabIndex={-1}>
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
            Addis-Abéba · La Nouvelle Fleur · {new Date().getFullYear()}
          </p>
        </footer>
        </PasswordGate>

      </body>
    </html>
  );
}
