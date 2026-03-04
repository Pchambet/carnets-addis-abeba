import { getLetterData, getSortedLettersData } from '@/lib/letters';
import HeroLetter from '@/components/Reading/HeroLetter';
import TibebDivider from '@/components/UI/TibebDivider';
import LightboxGallery from '@/components/Reading/LightboxGallery';
import CreativePrompt from '@/components/Reading/CreativePrompt';
import PullQuote from '@/components/Reading/PullQuote';
import ReadingProgress from '@/components/Reading/ReadingProgress';
import Comments from '@/components/Reading/Comments';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export async function generateStaticParams() {
    const letters = getSortedLettersData();
    return letters.map((letter) => ({ id: letter.id }));
}

function getPhotosForLetter(id: string) {
    const dir = path.join(process.cwd(), 'public', 'images', id);
    if (!fs.existsSync(dir)) return [];

    return fs
        .readdirSync(dir)
        .filter(f => /\.(jpg|jpeg|png|heic|webp)$/i.test(f))
        .map(f => ({
            src: `/images/${id}/${f}`,
            name: f.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        }));
}

/** Inject a pull quote block into the HTML after the ~3rd paragraph */
function injectPullQuote(contentHtml: string, pullQuote: string): string {
    const parts = contentHtml.split('</p>');
    if (parts.length < 4) return contentHtml;
    const insertAt = 3;
    const pqHtml = `</p><div data-pq="${encodeURIComponent(pullQuote)}"></div>`;
    parts[insertAt - 1] += pqHtml.replace(`</p>`, '');
    return parts.join('</p>');
}

export default async function LetterPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const letter = await getLetterData(resolvedParams.id);
    const photos = getPhotosForLetter(resolvedParams.id);

    // Determine hero image: first photo or fallback gradient
    const heroImage = photos.length > 0 ? photos[0].src : null;

    return (
        <article>
            <ReadingProgress />

            {/* ── 1. Hero (Priorité 2) ── */}
            {heroImage ? (
                <HeroLetter
                    title={letter.title}
                    date={letter.date}
                    location={letter.location}
                    excerpt={letter.excerpt}
                    heroImage={heroImage}
                    readTime={letter.readTime}
                />
            ) : (
                /* Fallback header without photo */
                <header className="px-6 md:px-12 py-20 md:py-28 border-b border-[var(--border)]">
                    <div className="max-w-4xl mx-auto">
                        <Link href="/" className="caption text-[var(--ink-light)] hover:text-[var(--ochre)] no-underline mb-12 inline-block">
                            ← Toutes les lettres
                        </Link>
                        <div className="flex flex-wrap gap-4 items-center mb-6">
                            <time className="caption text-[var(--ochre)]" dateTime={letter.date}>
                                {new Date(letter.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </time>
                            {letter.location && <span className="caption text-[var(--red)]">{letter.location}</span>}
                            <span className="read-time">⏱ {letter.readTime} min</span>
                        </div>
                        <h1 className="mb-6">{letter.title}</h1>
                    </div>
                </header>
            )}

            {/* Back link under hero */}
            <div className="px-6 md:px-12 pt-8">
                <div className="max-w-4xl mx-auto">
                    <Link href="/" className="caption text-[var(--ink-light)] hover:text-[var(--ochre)] no-underline">
                        ← Toutes les lettres
                    </Link>
                </div>
            </div>

            <TibebDivider />

            {/* ── 2. Letter body with drop cap + pull quote (Priorité 1) ── */}
            <div className="px-6 md:px-12 pb-12">
                <div className="reading-width mx-auto">
                    {/* Pull Quote placed above body text (Priorité 1) */}
                    {letter.pullQuote && <PullQuote text={letter.pullQuote} />}

                    {/* Body — drop-cap class applies ::first-letter to first <p> */}
                    <div
                        className="drop-cap prose prose-lg max-w-[65ch]
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
              prose-strong:text-[var(--ink)]
              prose-strong:font-medium
              prose-img:w-full
              prose-img:my-12
            "
                        dangerouslySetInnerHTML={{ __html: letter.contentHtml }}
                    />
                </div>
            </div>

            <TibebDivider />

            {/* ── 3. Photo Gallery with captions & credits (Priorité 1 + 2) ── */}
            {photos.length > 0 && (
                <div className="px-6 md:px-12 my-20">
                    {/* Section header */}
                    <p className="caption text-[var(--ochre)] text-center mb-2">Fragments du voyage</p>
                    <p className="photo-credit text-center mb-8 pr-0 text-[var(--ink-light)]">© Claire Stellio, Addis-Abéba</p>
                    <LightboxGallery photos={photos} />
                </div>
            )}

            <TibebDivider />

            {/* ── 4. Creative Prompt (Culturel) ── */}
            <CreativePrompt />

            {/* ── 5. Écrire à Claire CTA (Solidaire) ── */}
            <section className="text-center py-16 px-6">
                <p className="caption text-[var(--ink-light)] mb-4">
                    Cette lettre vous a touché ?
                </p>
                <a
                    href="mailto:claire.stellio@gmail.com?subject=En réponse à ta lettre"
                    className="inline-block border border-[var(--ochre)] text-[var(--ochre)] px-10 py-4 caption hover:bg-[var(--ochre)] hover:text-[var(--white)] transition-all duration-500 no-underline"
                >
                    Lui écrire un email privé
                </a>
            </section>

            {/* ── 6. Comments Section (Giscus) ── */}
            <Comments />

            {/* ── Navigation ── */}
            <div className="border-t border-[var(--border)] py-12 px-6 md:px-12 text-center">
                <Link href="/" className="caption text-[var(--ink-light)] hover:text-[var(--ochre)] no-underline">
                    ← Retour aux lettres
                </Link>
            </div>
        </article>
    );
}
