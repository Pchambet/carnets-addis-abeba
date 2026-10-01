'use client';

import dynamic from 'next/dynamic';
import type { LocationWithLetters } from '@/lib/map-locations';

const LetterMap = dynamic(() => import('@/components/Map/LetterMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] md:h-[520px] rounded-lg border border-[var(--border)] bg-[var(--paper)] flex items-center justify-center">
      <p className="caption text-[var(--ink-light)]">Chargement de la carte…</p>
    </div>
  ),
});

export default function LetterMapWrapper({ locations }: { locations: LocationWithLetters[] }) {
  return <LetterMap locations={locations} />;
}
