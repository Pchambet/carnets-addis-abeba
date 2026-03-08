import { getSortedLettersData } from '@/lib/letters';
import { getPhotosForLetter, type Photo } from '@/lib/photos';
import Link from 'next/link';
import TibebDivider from '@/components/UI/TibebDivider';
import LightboxGallery from '@/components/Reading/LightboxGallery';

interface LetterWithPhotos {
    id: string;
    title: string;
    date: string;
    location?: string;
    photos: Photo[];
}

export default function GalleriePage() {
    const letters = getSortedLettersData();

    const lettersWithPhotos: LetterWithPhotos[] = letters
        .map(l => ({ ...l, photos: getPhotosForLetter(l.id) }))
        .filter(l => l.photos.length > 0);

    const totalPhotos = lettersWithPhotos.reduce((sum, l) => sum + l.photos.length, 0);

    return (
        <div>
            {/* ── Header ── */}
            <section className="px-6 md:px-12 py-12 sm:py-16 md:py-20 border-b border-[var(--border)]">
                <div className="max-w-4xl mx-auto">
                    <p className="caption text-[var(--ochre)] mb-4">Carnets d&apos;Addis-Abéba</p>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-light leading-tight mb-6">
                        La galerie
                    </h1>
                    <p className="text-lg text-[var(--ink-light)] font-[family-name:var(--font-lora)] italic">
                        {totalPhotos} photographies — Addis-Abéba et au-delà.
                    </p>
                    <p className="photo-credit mt-2">© Claire Stellio</p>
                </div>
            </section>

            {/* ── Per-semaine galleries ── */}
            <div className="max-w-5xl mx-auto px-6 md:px-12 py-12 sm:py-16 md:py-20 space-y-16 sm:space-y-24">
                {lettersWithPhotos.map(letter => {
                    const formattedDate = new Date(letter.date).toLocaleDateString('fr-FR', {
                        month: 'long', year: 'numeric'
                    });
                    return (
                        <section key={letter.id}>
                            {/* Week header */}
                            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-6 gap-2 mb-8 pb-4 border-b border-[var(--border)]">
                                <Link
                                    href={`/letters/${letter.id}`}
                                    className="text-xl sm:text-2xl md:text-3xl font-light text-[var(--ink)] hover:text-[var(--ochre)] transition-colors duration-400 no-underline"
                                    style={{ fontFamily: 'var(--font-cormorant), serif' }}
                                >
                                    {letter.title}
                                </Link>
                                <div className="flex gap-4 flex-shrink-0">
                                    {letter.location && (
                                        <span className="caption text-[var(--red)]">{letter.location}</span>
                                    )}
                                    <time className="caption text-[var(--ink-light)]">{formattedDate}</time>
                                </div>
                            </div>

                            {/* Photo grid & Lightbox */}
                            <LightboxGallery photos={letter.photos} />
                            {/* Caption */}
                            <p className="photo-credit mt-4">
                                {letter.photos.length} photograph{letter.photos.length > 1 ? 'ies' : 'ie'} · © Claire Stellio, Addis-Abéba
                            </p>
                        </section>
                    );
                })}
            </div>

            <TibebDivider />
        </div>
    );
}
