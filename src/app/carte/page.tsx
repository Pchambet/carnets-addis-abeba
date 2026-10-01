import Link from 'next/link';
import { getSortedLettersData } from '@/lib/letters';
import { getLocationsWithLetters } from '@/lib/map-locations';
import LetterMapWrapper from '@/components/Map/LetterMapWrapper';
import PageHeader from '@/components/Layout/PageHeader';

export default function CartePage() {
  const letters = getSortedLettersData();
  const locations = getLocationsWithLetters(letters);

  // Ajout des points fixes
  const allLocations = [
    ...locations,
    {
      name: "Annecy (Maison de Claire)",
      lat: 45.8992,
      lng: 6.1294,
      zoom: 11,
      letterIds: [],
    },
    {
      name: "Paris (Pierre)",
      lat: 48.8566,
      lng: 2.3522,
      zoom: 11,
      letterIds: [],
    },
  ];

  return (
    <div>
      <PageHeader title="La carte">
        <p>Où les lettres ont été écrites, d’Addis-Abéba aux routes du Sud.</p>
      </PageHeader>

      <section className="site-container py-16">
        <LetterMapWrapper locations={allLocations} />

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
                          {letter.title}
                        </Link>
                        <span className="text-[var(--ink-light)] text-sm ml-3">{date}</span>
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
