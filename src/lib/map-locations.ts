/**
 * Lieux des lettres — coordonnées pour la carte interactive.
 * Les noms doivent correspondre au champ location du frontmatter.
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
  'Addis-Abéba': { name: 'Addis-Abéba', lat: 9.032, lng: 38.747, zoom: 11 },
  'Nairobi, Kenya': { name: 'Nairobi', lat: -1.292, lng: 36.822, zoom: 10 },
};

export function getLocationsWithLetters(
  letters: { id: string; location?: string }[]
): LocationWithLetters[] {
  const byLocation = new Map<string, string[]>();

  for (const letter of letters) {
    const loc = letter.location?.trim();
    if (!loc || !LOCATIONS[loc]) continue;
    const ids = byLocation.get(loc) ?? [];
    ids.push(letter.id);
    byLocation.set(loc, ids);
  }

  return Array.from(byLocation.entries()).map(([key, letterIds]) => ({
    ...LOCATIONS[key],
    letterIds,
  }));
}

export function getMapCenter(): [number, number] {
  return [6, 38]; // Entre Addis et Nairobi
}

export function getMapZoom(): number {
  return 4; // Vue régionale Afrique de l'Est
}
