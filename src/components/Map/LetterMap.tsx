'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { locationAnchor, type LocationWithLetters } from '@/lib/map-locations';
import { escapeHtml } from '@/lib/html';
import type { Map as LeafletMap } from 'leaflet';

interface LetterMapProps {
  locations: LocationWithLetters[];
}

export default function LetterMap({ locations }: LetterMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let map: LeafletMap | null = null;
    let cancelled = false;
    let observer: ResizeObserver | null = null;

    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current) return;
      const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      map = L.default.map(containerRef.current, {
        zoomAnimation: animate,
        fadeAnimation: animate,
        markerZoomAnimation: animate,
        zoomControl: false,
      });
      L.default.control.zoom({ zoomInTitle: 'Zoomer', zoomOutTitle: 'Dézoomer' }).addTo(map);
      // Cadre tous les lieux (France et Éthiopie) quelle que soit la taille d'écran ; recadre quand
      // la taille change, y compris quand la carte devient visible (masquée tant que le code n'est pas saisi)
      const frame = () => {
        map!.invalidateSize();
        map!.fitBounds(L.default.latLngBounds(locations.map(({ lat, lng }) => [lat, lng])), { padding: [24, 24] });
      };
      frame();
      observer = new ResizeObserver(frame);
      observer.observe(containerRef.current);

      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const icon = L.default.divIcon({
        html: '<span style="width:12px;height:12px;background:#8F5229;border:2px solid #F8F6F3;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);display:block"></span>',
        className: '',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      locations.forEach(({ lat, lng, name, letterIds }) => {
        const count = letterIds.length;
        const label = count > 1 ? `${name} (${count} lettres)` : name;

        // La bulle mène à la liste des lettres du lieu, sous la carte
        const link = count > 0 ? `<br><a href="#${locationAnchor(name)}">Voir ${count > 1 ? 'les lettres' : 'la lettre'}</a>` : '';
        L.default.marker([lat, lng], { icon, title: label, alt: label })
          .addTo(map!)
          .bindPopup(`<strong>${escapeHtml(label)}</strong>${link}`);
      });
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      map?.remove();
    };
  }, [locations]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Carte des lieux où les lettres ont été écrites"
      className="w-full h-[420px] md:h-[520px] rounded-lg overflow-hidden border border-[var(--border)] [&_.leaflet-container]:z-0"
    />
  );
}
