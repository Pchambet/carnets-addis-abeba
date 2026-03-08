'use client';

import dynamic from 'next/dynamic';
import type { LocationWithLetters } from '@/lib/map-locations';

const LetterMap = dynamic(() => import('@/components/Map/LetterMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-lg border border-[var(--border)] bg-[var(--paper)] flex items-center justify-center">
      <p className="caption text-[var(--ink-light)]">Chargement de la carte…</p>
    </div>
  ),
});

interface LetterMapWrapperProps {
  locations: LocationWithLetters[];
  center: [number, number];
  zoom: number;
}

export default function LetterMapWrapper({ locations, center, zoom }: LetterMapWrapperProps) {
  return <LetterMap locations={locations} center={center} zoom={zoom} />;
}
