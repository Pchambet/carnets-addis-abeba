import Image from 'next/image';
import { ETHIOPIC_WEEK, weekLabel } from '@/lib/letters';


interface HeroLetterProps {
    title: string;
    date: string;
    location?: string;
    excerpt?: string;
    heroImage: string; // path relative to /public
    heroBlurDataURL?: string; // base64 blur for smooth loading
    heroPosition?: string; // ex: "top", "center 30%" — zone affichée (object-position)
    letterId?: string; // ex: "semaine-08" → affiche ሳምንት 8
}

export default function HeroLetter({
    title, date, location, excerpt, heroImage, heroBlurDataURL, heroPosition, letterId
}: HeroLetterProps) {
    const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const week = letterId ? weekLabel(letterId) : null;

    return (
        <div className="hero-letter hero-immersive" data-immersive-hero>
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

            {/* Voiles : en haut pour l'en-tête transparent, en bas pour le titre ; le centre de la photo reste intact */}
            <div
                className="absolute inset-0 z-[1]"
                style={{
                    background: 'linear-gradient(to bottom, rgba(18,12,8,0.6) 0%, rgba(18,12,8,0.25) 14%, transparent 30%), linear-gradient(to top, rgba(18,12,8,0.88) 0%, rgba(18,12,8,0.6) 30%, rgba(18,12,8,0.2) 55%, transparent 72%)',
                }}
            />

            {/* Content */}
            <div className="hero-letter-content site-container">
                <div className="hero-letter-meta hero-letter-fade-in">
                    {week && (
                        <span className="hero-letter-week">
                            <span className="ethiopic">{ETHIOPIC_WEEK}</span> {week}
                        </span>
                    )}
                    <div className="hero-letter-date-row gap-x-4">
                        <time dateTime={date}>{formattedDate}</time>
                        {location && <span className="hero-letter-location">{location}</span>}
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

                <a href="#lettre" className="hero-letter-back caption inline-block mt-10 no-underline transition-colors duration-250">
                    Commencer la lecture ↓
                </a>
            </div>
        </div>
    );
}
