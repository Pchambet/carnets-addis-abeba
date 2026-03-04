import { getSortedLettersData } from '@/lib/letters';
import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import Link from 'next/link';
import TibebDivider from '@/components/UI/TibebDivider';

interface LetterWithPhotos {
    id: string;
    title: string;
    date: string;
    location?: string;
    photos: { src: string; name: string }[];
}

function getPhotosForLetter(id: string) {
    const dir = path.join(process.cwd(), 'public', 'images', id);
    if (!fs.existsSync(dir)) return [];
    return fs
        .readdirSync(dir)
        .filter(f => /\.(jpg|jpeg|png|heic|webp)$/i.test(f))
        .map(f => ({ src: `/images/${id}/${f}`, name: f.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') }));
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
            <section className="px-6 md:px-12 py-20 border-b border-[var(--border)]">
                <div className="max-w-4xl mx-auto">
                    <p className="caption text-[var(--ochre)] mb-4">Carnets d'Addis-Abéba</p>
                    <h1 className="text-4xl md:text-6xl font-light leading-tight mb-6">
                        La galerie
                    </h1>
                    <p className="text-lg text-[var(--ink-light)] font-[family-name:var(--font-lora)] italic">
                        {totalPhotos} photographies — Addis-Abéba et au-delà.
                    </p>
                    <p className="photo-credit mt-2">© Claire Bonnet</p>
                </div>
            </section>

            {/* ── Per-semaine galleries ── */}
            <div className="max-w-5xl mx-auto px-6 md:px-12 py-20 space-y-24">
                {lettersWithPhotos.map(letter => {
                    const formattedDate = new Date(letter.date).toLocaleDateString('fr-FR', {
                        month: 'long', year: 'numeric'
                    });
                    return (
                        <section key={letter.id}>
                            {/* Week header */}
                            <div className="flex items-baseline gap-6 mb-8 pb-4 border-b border-[var(--border)]">
                                <Link
                                    href={`/letters/${letter.id}`}
                                    className="text-2xl md:text-3xl font-light text-[var(--ink)] hover:text-[var(--ochre)] transition-colors duration-400 no-underline"
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

                            {/* Photo grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {letter.photos.map((photo, i) => (
                                    <div
                                        key={i}
                                        className="relative aspect-square overflow-hidden bg-[var(--border)] cursor-zoom-in"
                                        title={photo.name}
                                    >
                                        <Image
                                            src={photo.src}
                                            alt={photo.name}
                                            fill
                                            className="object-cover transition-transform duration-700 hover:scale-[1.04]"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                            style={{ filter: 'contrast(1.02) saturate(0.93)' }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Caption */}
                            <p className="photo-credit mt-4">
                                {letter.photos.length} photograph{letter.photos.length > 1 ? 'ies' : 'ie'} · © Claire Bonnet, Addis-Abéba
                            </p>
                        </section>
                    );
                })}
            </div>

            <TibebDivider />
        </div>
    );
}
