import Image from 'next/image';
import Link from 'next/link';
import { ETHIOPIC_WEEK, weekLabel } from '@/lib/letters';


interface HeroLetterProps {
    title: string;
    date: string;
    location?: string;
    excerpt?: string;
    heroImage: string; // path relative to /public
    heroBlurDataURL?: string; // base64 blur for smooth loading
    heroPosition?: string; // ex: "top", "center 30%" — zone affichée (object-position)
    readTime: number;
    letterId?: string; // ex: "semaine-08" → affiche ሳምንት 8
}

export default function HeroLetter({
    title, date, location, excerpt, heroImage, heroBlurDataURL, heroPosition, readTime, letterId
}: HeroLetterProps) {
    const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const week = letterId ? weekLabel(letterId) : null;

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
                placeholder={heroBlurDataURL ? "blur" : "empty"}
                blurDataURL={heroBlurDataURL}
                style={{
                    objectFit: 'cover',
                    objectPosition: heroPosition ?? 'center',
                }}
            />

            {/* Gradient overlay — fondu progressif (4 stops) */}
            <div
                className="absolute inset-0 z-[1]"
                style={{
                    background: 'linear-gradient(to top, rgba(18,12,8,0.7) 0%, rgba(18,12,8,0.4) 30%, rgba(18,12,8,0.15) 60%, transparent 100%)',
                }}
            />

            {/* Content */}
            <div className="hero-letter-content site-container">
                <Link
                    href="/"
                    className="hero-letter-back caption inline-block mb-10 no-underline transition-colors duration-250"
                >
                    ← Toutes les lettres
                </Link>

                <div className="hero-letter-meta hero-letter-fade-in">
                    {week && (
                        <span className="hero-letter-week">
                            <span className="ethiopic">{ETHIOPIC_WEEK}</span> {week}
                        </span>
                    )}
                    <div className="hero-letter-date-row gap-x-4">
                        <time dateTime={date}>{formattedDate}</time>
                        {location && <span className="hero-letter-location">{location}</span>}
                        <span className="hero-letter-read-time">{readTime} min de lecture</span>
                    </div>
                </div>

                <h1 className="hero-letter-title hero-letter-fade-in max-w-4xl mb-6 sm:mb-8" style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}>
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
