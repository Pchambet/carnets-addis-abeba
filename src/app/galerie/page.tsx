import { getSortedLettersData } from '@/lib/letters';
import { getPhotosForLetter, type Photo } from '@/lib/photos';
import Link from 'next/link';
import TibebDivider from '@/components/UI/TibebDivider';
import PageHeader from '@/components/Layout/PageHeader';
import LightboxGallery from '@/components/Reading/LightboxGallery';

interface LetterWithPhotos {
    id: string;
    title: string;
    date: string;
    location?: string;
    photos: Photo[];
}

export default async function GalleriePage() {
    const letters = getSortedLettersData();

    const lettersWithPhotosRaw = await Promise.all(
        letters.map(async (l) => ({ ...l, photos: await getPhotosForLetter(l.id) }))
    );
    const lettersWithPhotos: LetterWithPhotos[] = lettersWithPhotosRaw.filter(l => l.photos.length > 0);

    const totalPhotos = lettersWithPhotos.reduce((sum, l) => sum + l.photos.length, 0);

    return (
        <div>
            <PageHeader title="La galerie">
                <p>{totalPhotos} photographies, lettre après lettre.</p>
            </PageHeader>

            {/* ── Sommaire : aller directement aux photos d'une lettre ── */}
            <nav aria-label="Lettres de la galerie" className="site-container pt-10">
                <details className="group">
                    <summary className="caption cursor-pointer text-[var(--ochre)] w-fit">
                        Aller directement à une lettre
                    </summary>
                    <ul className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3 font-[family-name:var(--font-lora)]">
                        {lettersWithPhotos.map((letter) => (
                            <li key={letter.id}>
                                <a href={`#${letter.id}`} className="text-[var(--ink-light)] hover:text-[var(--ochre)] no-underline">
                                    {letter.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </details>
            </nav>

            {/* ── Per-semaine galleries ── */}
            <div className="site-container py-12 sm:py-16 md:py-20 space-y-16 sm:space-y-24">
                {lettersWithPhotos.map(letter => {
                    const formattedDate = new Date(letter.date).toLocaleDateString('fr-FR', {
                        month: 'long', year: 'numeric'
                    });
                    return (
                        <section key={letter.id} id={letter.id} className="scroll-mt-28">
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
                        </section>
                    );
                })}
            </div>

            <TibebDivider />
        </div>
    );
}
