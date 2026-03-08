'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const ReactCusdis = dynamic(
  () =>
    import('react-cusdis')
      .then((m) => m.ReactCusdis)
      .catch(() => ({
        default: () => (
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="caption text-[var(--ink-light)] opacity-70">
              Les commentaires ne sont pas disponibles pour le moment.
            </p>
          </div>
        ),
      })),
  { ssr: false, loading: () => <CommentsSkeleton /> }
);

function CommentsSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <p className="caption text-[var(--ink-light)] opacity-60">Chargement…</p>
    </div>
  );
}

export default function Comments({ id, title }: { id: string; title: string }) {
  const pathname = usePathname();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://carnets-addis-abeba.vercel.app');
  const appId = process.env.NEXT_PUBLIC_CUSDIS_APP_ID || 'e5deb779-2d3a-4380-a2ca-bec214a584eb';
  const normalizedPath = pathname?.endsWith('/') ? pathname : `${pathname || ''}/`;
  const pageUrl = `${siteUrl}${normalizedPath}`;

  return (
    <section className="max-w-4xl mx-auto px-6 md:px-12 py-12 mt-16">
      <h2 className="text-xl font-[family-name:var(--font-cormorant)] font-light text-[var(--ink)] mb-6">
        Livre d&apos;or
      </h2>
      <div className="relative min-h-[200px]">
        <ReactCusdis
          attrs={{
            host: 'https://cusdis.com',
            appId,
            pageId: id,
            pageUrl,
            pageTitle: title,
            theme: 'light',
          }}
          lang="fr"
          style={{ minHeight: '22rem' }}
        />
      </div>
    </section>
  );
}
