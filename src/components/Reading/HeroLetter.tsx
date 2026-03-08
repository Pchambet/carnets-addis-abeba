import Image from 'next/image';
import Link from 'next/link';

/** ሳምንት = « semaine » en amharique */
const ETHIOPIC_WEEK = 'ሳምንት';

interface HeroLetterProps {
    title: string;
    date: string;
    location?: string;
    excerpt?: string;
    heroImage: string; // path relative to /public
    heroPosition?: string; // ex: "top", "center 30%" — zone affichée (object-position)
    readTime: number;
    letterId?: string; // ex: "semaine-08" → affiche ሳምንት 8
}

function getWeekNumber(letterId: string | undefined): number | null {
    if (!letterId) return null;
    const m = letterId.match(/semaine-(\d+)/i);
    return m ? parseInt(m[1], 10) : null;
}

export default function HeroLetter({
    title, date, location, excerpt, heroImage, heroPosition, readTime, letterId
}: HeroLetterProps) {
    const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const weekNum = getWeekNumber(letterId);

    return (
        <div className="hero-letter">
            {/* Background image — full bleed, darkened */}
            <Image
                src={heroImage}
                alt={`Photo d'illustration pour "${title}"`}
                fill
                className="hero-letter-bg"
                priority
                sizes="100vw"
                style={{
                    objectFit: 'cover',
                    objectPosition: heroPosition ?? 'center',
                }}
            />

            {/* Gradient overlay — fondu progressif (4 stops) */}
            <div
                className="absolute inset-0 z-[1]"
                style={{
                    background: 'linear-gradient(to top, rgba(18,12,8,0.9) 0%, rgba(18,12,8,0.65) 30%, rgba(18,12,8,0.3) 60%, transparent 100%)',
                }}
            />

            {/* Lien retour — overlay coin haut-gauche */}
            <Link
                href="/"
                className="hero-letter-back absolute top-6 left-6 md:top-8 md:left-8 z-10 caption no-underline transition-colors duration-250"
            >
                ← Toutes les lettres
            </Link>

            {/* Content */}
            <div className="hero-letter-content">
                <div className="hero-letter-meta hero-letter-fade-in">
                    {weekNum !== null && (
                        <span className="hero-letter-week">
                            <span className="ethiopic">{ETHIOPIC_WEEK}</span> {weekNum}
                        </span>
                    )}
                    <div className="hero-letter-date-row">
                        <time dateTime={date}>{formattedDate}</time>
                        {location && (
                            <>
                                <span className="hero-letter-sep">·</span>
                                <span className="hero-letter-location">{location}</span>
                            </>
                        )}
                        <span className="hero-letter-sep">·</span>
                        <span className="hero-letter-read-time">⏱ {readTime} min</span>
                    </div>
                </div>

                <h1 className="hero-letter-title hero-letter-fade-in mb-6 sm:mb-8" style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}>
                    {title}
                </h1>

                {excerpt && (
                    <p
                        className="hero-letter-excerpt hero-letter-fade-in text-base sm:text-lg italic max-w-prose leading-relaxed mt-2"
                        style={{ fontFamily: 'var(--font-lora), serif', color: '#FDFAF6' }}
                    >
                        {excerpt}
                    </p>
                )}
            </div>
        </div>
    );
}
