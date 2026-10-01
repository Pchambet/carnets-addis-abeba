import type { Metadata } from 'next';
import { Cormorant_Garamond, Lora, Noto_Sans_Ethiopic, Sacramento } from 'next/font/google';
import './globals.css';
import PasswordGate from '@/components/PasswordGate';
import SiteHeader from '@/components/Layout/SiteHeader';

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
    default: 'La Parenthèse du dimanche soir',
    template: '%s — La Parenthèse du dimanche soir',
  },
  description: 'Une lettre par semaine depuis Addis-Abéba — Nouvelles hebdomadaires d\'un voyage en Éthiopie.',
  metadataBase: new URL(siteUrl),
  // Site personnel partagé par lien : pas d'indexation par les moteurs de recherche
  robots: { index: false, follow: false },
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

        <SiteHeader />

        {/* ── Main ── */}
        <main id="main-content" className="site-main flex-1" tabIndex={-1}>
          {children}
        </main>

        {/* ── Footer ── */}
        <footer className="mt-24 py-14 border-t border-[var(--border)]">
          <div className="site-container flex flex-col items-center gap-5 text-center">
            {/* Motif tibeb : ocre, rouge, or */}
            <div className="flex gap-3" aria-hidden="true">
              <span className="w-2 h-2 rotate-45 bg-[var(--ochre)] opacity-60" />
              <span className="w-2 h-2 rotate-45 bg-[var(--red)] opacity-60" />
              <span className="w-2 h-2 rotate-45 bg-[var(--gold)] opacity-60" />
            </div>
            <p className="font-[family-name:var(--font-cormorant)] italic text-lg text-[var(--ink-light)]">
              Depuis Addis-Abéba, la Nouvelle Fleur
            </p>
          </div>
        </footer>
        </PasswordGate>

      </body>
    </html>
  );
}
