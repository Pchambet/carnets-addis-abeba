'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import type { LocationWithLetters } from '@/lib/map-locations';
import type { Map as LeafletMap } from 'leaflet';

interface LetterMapProps {
  locations: LocationWithLetters[];
  center: [number, number];
  zoom: number;
}

export default function LetterMap({ locations, center, zoom }: LetterMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    let map: LeafletMap | null = null;
    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current) return;
      map = L.default.map(containerRef.current).setView(center, zoom);

      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const icon = L.default.divIcon({
        html: '<span style="width:12px;height:12px;background:#B87040;border:2px solid #F8F6F3;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);display:block;margin:-6px 0 0 -6px"></span>',
        className: '',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      locations.forEach(({ lat, lng, name, letterIds }) => {
        const count = letterIds.length;
        const label = count > 1 ? `${name} (${count} lettres)` : name;

        L.default.marker([lat, lng], { icon })
          .addTo(map!)
          .bindPopup(`<strong>${label}</strong>`);
      });
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [locations, center, zoom]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[400px] rounded-lg overflow-hidden border border-[var(--border)] [&_.leaflet-container]:z-0"
    />
  );
}
