import { getSortedLettersData } from '@/lib/letters';
import Timeline from '@/components/Home/Timeline';
import Image from 'next/image';
import { getBlurDataURL } from '@/lib/blur';
import { getLetterCover } from '@/lib/photos';

/** « d’octobre 2025 à septembre 2026 » : de la première à la dernière lettre */
function journeySpan(letters: { date: string }[]): string {
    const month = (d: string) => new Date(d).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const first = month(letters[letters.length - 1].date);
    const last = month(letters[0].date);
    return first === last ? `en ${first}` : `${/^[aeiouéè]/i.test(first) ? 'd’' : 'de '}${first} à ${last}`;
}

export default async function Home() {
    const letters = getSortedLettersData().map((l) => ({ ...l, cover: getLetterCover(l.id, l.heroImage) }));
    const heroBlurDataURL = await getBlurDataURL('/images/home-hero.jpg');

    return (
        <div>
            {/* ── Hero pleine largeur, responsive (IMG_1206) ── */}
            <section className="hero-letter home-hero border-b border-[var(--border)]">
                <Image
                    src="/images/home-hero.jpg"
                    alt="Addis-Abéba — La Nouvelle Fleur"
                    className="hero-letter-bg"
                    priority
                    fill
                    sizes="100vw"
                    placeholder={heroBlurDataURL ? "blur" : "empty"}
                    blurDataURL={heroBlurDataURL}
                    style={{ objectFit: 'cover' }}
                />
                <div
                    className="absolute inset-0 z-[1]"
                    style={{
                        background: 'linear-gradient(to top, rgba(20,10,5,0.75) 0%, rgba(20,10,5,0.18) 60%, transparent 100%)',
                    }}
                />
                <div className="hero-letter-content site-container">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-light leading-tight mb-6 max-w-3xl" style={{ color: '#FDFAF6', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
                        Nouvelles hebdomadaires<br />
                        <em className="text-[var(--gold)]">depuis la Nouvelle Fleur</em>
                    </h1>
                    {letters.length > 0 && (
                        <p className="text-base sm:text-lg max-w-prose leading-loose font-[family-name:var(--font-lora)] opacity-90" style={{ color: '#FDFAF6' }}>
                            {letters.length} lettres d’Addis-Abéba, {journeySpan(letters)}.
                        </p>
                    )}
                </div>
            </section>

            {/* ── Timeline des lettres ── */}
            <section className="site-container py-16 md:py-24">
                <Timeline letters={letters} />
            </section>
        </div>
    );
}
