import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLetterData, getSortedLettersData } from '@/lib/letters';
import { getPhotosForLetter, getVideosForLetter } from '@/lib/photos';
import HeroLetter from '@/components/Reading/HeroLetter';
import TibebDivider from '@/components/UI/TibebDivider';
import LightboxGallery from '@/components/Reading/LightboxGallery';
import VideoSection from '@/components/Reading/VideoSection';
import PullQuote from '@/components/Reading/PullQuote';
import ReadingProgress from '@/components/Reading/ReadingProgress';
import Comments from '@/components/Reading/Comments';
import Link from 'next/link';

export async function generateStaticParams() {
    try {
        const letters = getSortedLettersData();
        return letters.map((letter) => ({ id: letter.id }));
    } catch {
        return [];
    }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://carnets-addis-abeba.vercel.app';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    try {
        const letter = await getLetterData(id);
        const photos = getPhotosForLetter(id);
        const ogImagePath = letter.heroImage ?? photos[0]?.src;
        const ogImageUrl = ogImagePath ? (ogImagePath.startsWith('http') ? ogImagePath : `${SITE_URL}${ogImagePath}`) : undefined;
        const description = letter.excerpt ?? letter.pullQuote ?? `${letter.title} — lettre depuis Addis-Abéba`;

        return {
            title: letter.title,
            description,
            openGraph: {
                title: letter.title,
                description,
                type: 'article',
                publishedTime: letter.date,
                locale: 'fr_FR',
                ...(ogImageUrl && {
                    images: [{ url: ogImageUrl, width: 1200, height: 630, alt: letter.title }],
                }),
            },
            twitter: {
                card: 'summary_large_image',
                title: letter.title,
                description,
                ...(ogImageUrl && { images: [ogImageUrl] }),
            },
        };
    } catch {
        return { title: 'Lettre' };
    }
}

/** Format "Claire" signature at the end of the content */
function formatSignature(contentHtml: string): string {
    // Look for "Claire" at the end, possibly wrapped in tags or preceded by spaces
    // Handles variants like "Claire", "Claire STELLIO", "*Claire*"
    return contentHtml.replace(
        /<p[^>]*>(?:&nbsp;|\s)*([*_]*Claire(?:[^<]*))[*_]*<\/p>\s*$/i,
        '<p class="signature">$1</p>'
    );
}

export default async function LetterPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    let letter;
    try {
        letter = await getLetterData(resolvedParams.id);
    } catch {
        notFound();
    }
    const photos = getPhotosForLetter(resolvedParams.id);
    const videos = getVideosForLetter(resolvedParams.id);

    // Hero image : heroImage du frontmatter en priorité, sinon 1ère photo
    const heroImage = letter.heroImage ?? (photos.length > 0 ? photos[0].src : null);

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
                    heroPosition={letter.heroPosition}
                    readTime={letter.readTime}
                    letterId={resolvedParams.id}
                />
            ) : (
                <header className="px-6 md:px-12 py-20 md:py-28 border-b border-[var(--border)]">
                    <div className="max-w-4xl mx-auto">
                        <Link href="/" className="caption text-[var(--ink-light)] hover:text-[var(--ochre)] no-underline mb-12 inline-block transition-colors duration-250">
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

            <TibebDivider />

            {/* ── 2. Letter body with drop cap + pull quote (Priorité 1) ── */}
            <div className="px-6 md:px-12 pb-12">
                <div className="reading-width mx-auto">
                    {letter.pullQuote && <PullQuote text={letter.pullQuote} />}

                    <div className="letter-body">
                    <div
                        className="drop-cap prose prose-base sm:prose-lg max-w-[65ch]
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
                        dangerouslySetInnerHTML={{ __html: formatSignature(letter.contentHtml) }}
                    />
                    </div>
                </div>
            </div>

            <TibebDivider />

            {/* ── 3. Photo Gallery with captions & credits (Priorité 1 + 2) ── */}
            {photos.length > 0 && (
                <div className="px-6 md:px-12 my-20">
                    <p className="caption text-[var(--ochre)] text-center mb-2">Fragments du voyage</p>
                    <p className="photo-credit text-center mb-8 pr-0 text-[var(--ink-light)]">© Claire Stellio, Addis-Abéba</p>
                    <LightboxGallery photos={photos} />
                </div>
            )}

            {videos.length > 0 && (
                <div className="px-6 md:px-12 my-20">
                    <VideoSection videos={videos} />
                </div>
            )}

            <TibebDivider />

            {/* ── Comments Section (Cusdis) ── */}
            <Comments id={letter.id} title={letter.title} />

            {/* ── Navigation ── */}
            <div className="border-t border-[var(--border)] py-12 px-6 md:px-12 text-center">
                <Link href="/" className="caption text-[var(--ink-light)] hover:text-[var(--ochre)] no-underline transition-colors duration-250">
                    ← Retour aux lettres
                </Link>
            </div>
        </article>
    );
}
