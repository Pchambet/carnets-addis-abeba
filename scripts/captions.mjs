/**
 * Légendes des médias : le nom de fichier donné par Claire devient la légende,
 * pas les noms d'appareil ou d'application.
 */

// Noms d'appareil ou d'application ; 20260927_172943 et les UUID seulement s'ils sont le nom entier
const TECHNICAL_NAME = /^(IMG[-_]?\d+|DSCF?\d+|motion_photo_\d+|IMG-\d{8}-WA\d+|VID[-_]|IMG_\d{8}_\d+|PXL_|\d{8}_\d{6}$|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|\d+$)/i;

/** Légende tirée d'un nom de fichier sans extension, ou null pour un nom technique. */
export function captionFrom(base) {
  const caption = base
    .replace(/[❤♥]️?/g, '') // ❤️ : marque de la photo principale
    .replace(/[_\s]*\(\d+\)$/, '') // « Concert_(1) » : suffixe de copie de macOS
    .replace(/[_\s]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Testé après nettoyage : « ❤️ IMG_1234 » reste un nom d'appareil
  if (TECHNICAL_NAME.test(caption)) return null;
  return caption.length > 1 ? caption : null;
}
