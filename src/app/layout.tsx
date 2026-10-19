import type { Metadata } from 'next';
import { Cormorant_Garamond, Lora, Sacramento } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import PasswordGate from '@/components/PasswordGate';
import SiteHeader from '@/components/Layout/SiteHeader';
import { ACCESS_SCRIPT, HAS_GATE } from '@/lib/access';
import { SITE_URL } from '@/lib/site';

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

// Noto Sans Ethiopic réduite aux lettres de « ሳምንት » (fonts.googleapis.com/css2?…&text=ሳምንት) :
// 2 Ko au lieu de 198 Ko préchargés sur chaque page. Licence SIL OFL 1.1.
const ethiopic = localFont({
  src: [{ path: '../fonts/noto-sans-ethiopic-semaine.woff2', weight: '300 400' }],
  variable: '--font-ethiopic',
  display: 'swap',
});

const signature = Sacramento({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-signature',
  display: 'swap',
  // Signature en fin de lettre seulement : inutile de la précharger partout
  preload: false,
});


export const metadata: Metadata = {
  title: {
    default: 'La Parenthèse du dimanche soir',
    template: '%s — La Parenthèse du dimanche soir',
  },
  description: 'Une lettre par semaine depuis Addis-Abéba — Nouvelles hebdomadaires d’un voyage en Éthiopie.',
  metadataBase: new URL(SITE_URL),
  // Site personnel partagé par lien : pas d'indexation par les moteurs de recherche
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'La Parenthèse du dimanche soir',
    images: [{ url: '/images/home-hero.jpg', alt: 'Addis-Abéba — La Nouvelle Fleur' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning : data-access est posé par ACCESS_SCRIPT avant React
    <html lang="fr" data-scroll-behavior="smooth" suppressHydrationWarning className={`${cormorant.variable} ${lora.variable} ${ethiopic.variable} ${signature.variable}`}>
      {HAS_GATE && (
        <head>
          <script dangerouslySetInnerHTML={{ __html: ACCESS_SCRIPT }} />
        </head>
      )}
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
