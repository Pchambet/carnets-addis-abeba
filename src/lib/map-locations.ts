/**
 * Lieux des lettres — coordonnées pour la carte interactive.
 * Le champ location du frontmatter peut citer plusieurs lieux séparés par « & » ;
 * chacun doit figurer ici (vérifié par les tests).
 */

export interface MapLocation {
  name: string;
  lat: number;
  lng: number;
  zoom: number;
}

export interface LocationWithLetters extends MapLocation {
  letterIds: string[];
}

const LOCATIONS: Record<string, MapLocation> = {
  'Addis-Abeba': { name: 'Addis-Abéba', lat: 9.032, lng: 38.747, zoom: 11 },
  'Nairobi, Kenya': { name: 'Nairobi', lat: -1.292, lng: 36.822, zoom: 10 },
  'Arba-Minch': { name: 'Arba Minch', lat: 6.033, lng: 37.55, zoom: 11 },
  'Hawassa': { name: 'Hawassa', lat: 7.062, lng: 38.476, zoom: 11 },
  'Miki': { name: 'Meki', lat: 8.15, lng: 38.817, zoom: 11 },
  'Mont Hambaricho': { name: 'Mont Hambaricho', lat: 7.27, lng: 37.86, zoom: 11 },
  'Shishinda': { name: 'Shishinda', lat: 7.283, lng: 35.867, zoom: 11 },
};

/** Lieux cités par une lettre : "Hawassa & Miki" → ["Hawassa", "Miki"] */
export function splitLocation(location: string | undefined): string[] {
  return (location ?? '').split('&').map((l) => l.trim()).filter(Boolean);
}

export function isKnownLocation(place: string): boolean {
  return place in LOCATIONS;
}

export function getLocationsWithLetters(
  letters: { id: string; location?: string }[]
): LocationWithLetters[] {
  const byLocation = new Map<string, string[]>();

  for (const letter of letters) {
    for (const place of splitLocation(letter.location)) {
      if (!isKnownLocation(place)) continue;
      const ids = byLocation.get(place) ?? [];
      ids.push(letter.id);
      byLocation.set(place, ids);
    }
  }

  return Array.from(byLocation.entries()).map(([key, letterIds]) => ({
    ...LOCATIONS[key],
    letterIds,
  }));
}

export function getMapCenter(): [number, number] {
  return [25, 20]; // Centre entre la France et l'Éthiopie
}

export function getMapZoom(): number {
  return 3; // Vue globale Europe - Afrique de l'Est
}
