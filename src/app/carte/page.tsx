import Link from 'next/link';
import { getSortedLettersData } from '@/lib/letters';
import {
  getLocationsWithLetters,
  getMapCenter,
  getMapZoom,
} from '@/lib/map-locations';
import LetterMapWrapper from '@/components/Map/LetterMapWrapper';

export default function CartePage() {
  const letters = getSortedLettersData();
  const locations = getLocationsWithLetters(letters);
  const center = getMapCenter();
  const zoom = getMapZoom();

  return (
    <div>
      <section className="px-6 md:px-12 py-20 border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto">
          <p className="caption text-[var(--ochre)] mb-4">Carnets d&apos;Addis-Abéba</p>
          <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-cormorant)] font-light italic text-[var(--ink)] mb-6 tracking-tight">
            La carte
          </h1>
          <p className="text-lg text-[var(--ink-light)] font-[family-name:var(--font-lora)] leading-relaxed">
            Où les lettres ont été écrites.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-12 py-16">
        <LetterMapWrapper locations={locations} center={center} zoom={zoom} />

        {locations.length > 0 && (
          <div className="mt-12 space-y-6">
            {locations.map((loc) => (
              <div key={loc.name} className="border-b border-[var(--border)] last:border-b-0 pb-6">
                <h2 className="text-xl font-[family-name:var(--font-cormorant)] font-light text-[var(--ink)] mb-3">
                  {loc.name}
                </h2>
                <ul className="space-y-2">
                  {loc.letterIds.map((id) => {
                    const letter = letters.find((l) => l.id === id);
                    if (!letter) return null;
                    const date = new Date(letter.date).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    });
                    return (
                      <li key={id}>
                        <Link
                          href={`/letters/${id}`}
                          className="text-[var(--ink)] hover:text-[var(--ochre)] transition-colors duration-250"
                        >
                          {letter.title} — {date}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
