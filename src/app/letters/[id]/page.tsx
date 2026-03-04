import { getLetterData, getSortedLettersData } from '@/lib/letters';
import TibebDivider from '@/components/UI/TibebDivider';
import PhotoGallery from '@/components/Reading/PhotoGallery';
import CreativePrompt from '@/components/Reading/CreativePrompt';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export async function generateStaticParams() {
    const letters = getSortedLettersData();
    return letters.map((letter) => ({ id: letter.id }));
}

// Build a photo list from the matching public/images/ directory
function getPhotosForLetter(id: string) {
    const dir = path.join(process.cwd(), 'public', 'images', id);
    if (!fs.existsSync(dir)) return [];

    return fs
        .readdirSync(dir)
        .filter(f => /\.(jpg|jpeg|png|heic|webp)$/i.test(f))
        .map(f => ({
            src: `/images/${id}/${f}`,
            alt: f.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        }));
}

export default async function LetterPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const letter = await getLetterData(resolvedParams.id);
    const photos = getPhotosForLetter(resolvedParams.id);

    const formattedDate = new Date(letter.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <article>

            {/* ── 1. Letter Header ── */}
            <header className="px-6 md:px-12 py-20 md:py-28 border-b border-[var(--border)]">
                <div className="max-w-4xl mx-auto">
                    <Link href="/" className="caption text-[var(--ink-light)] hover:text-[var(--ochre)] no-underline mb-12 inline-block">
                        ← Toutes les lettres
                    </Link>
                    <div className="flex flex-wrap gap-6 items-baseline mb-8">
                        <time className="caption text-[var(--ochre)]" dateTime={letter.date}>
                            {formattedDate}
                        </time>
                        {letter.location && (
                            <span className="caption text-[var(--red)]">{letter.location}</span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-light leading-tight text-[var(--ink)] mb-8">
                        {letter.title}
                    </h1>
                    {letter.excerpt && (
                        <p className="text-xl md:text-2xl italic font-light text-[var(--ink-light)] max-w-2xl leading-relaxed font-[family-name:var(--font-lora)]">
                            « {letter.excerpt} »
                        </p>
                    )}
                </div>
            </header>

            <TibebDivider />

            {/* ── 2. Letter Body (Spirituel) ── */}
            <div className="px-6 md:px-12 pb-12">
                <div
                    className="reading-width prose prose-lg max-w-[65ch] mx-auto
            prose-headings:font-[family-name:var(--font-cormorant)]
            prose-headings:font-light
            prose-headings:text-[var(--ink)]
            prose-p:font-[family-name:var(--font-lora)]
            prose-p:text-[var(--ink)]
            prose-p:leading-[2]
            prose-p:my-8
            prose-blockquote:border-l-[var(--ochre)]
            prose-blockquote:text-[var(--ink-light)]
            prose-blockquote:italic
            prose-blockquote:font-light
            prose-strong:text-[var(--ink)]
            prose-strong:font-medium
            prose-img:rounded-none
            prose-img:shadow-none
            prose-img:w-full
            prose-img:my-12
          "
                    dangerouslySetInnerHTML={{ __html: letter.contentHtml }}
                />
            </div>

            <TibebDivider />

            {/* ── 3. Photo Gallery (Solidaire) ── */}
            {photos.length > 0 && (
                <div className="px-6 md:px-12">
                    <PhotoGallery photos={photos} />
                </div>
            )}

            <TibebDivider />

            {/* ── 4. Creative Prompt (Culturel) ── */}
            <CreativePrompt />

            {/* ── 5. "Écrire à Claire" CTA (Solidaire) ── */}
            <section className="text-center py-16 px-6">
                <p className="caption text-[var(--ink-light)] mb-4">
                    Cette lettre vous a touché ?
                </p>
                <a
                    href="mailto:claire@example.com?subject=En réponse à ta lettre"
                    className="inline-block border border-[var(--ochre)] text-[var(--ochre)] px-10 py-4 caption hover:bg-[var(--ochre)] hover:text-[var(--white)] transition-all duration-500 no-underline"
                >
                    Écrire à Claire
                </a>
            </section>

            {/* ── Navigation ── */}
            <div className="border-t border-[var(--border)] py-12 px-6 md:px-12 text-center">
                <Link href="/" className="caption text-[var(--ink-light)] hover:text-[var(--ochre)] no-underline">
                    ← Retour aux lettres
                </Link>
            </div>

        </article>
    );
}
