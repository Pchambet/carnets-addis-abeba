import Image from 'next/image';

interface HeroLetterProps {
    title: string;
    date: string;
    location?: string;
    excerpt?: string;
    heroImage: string; // path relative to /public
    readTime: number;
}

export default function HeroLetter({
    title, date, location, excerpt, heroImage, readTime
}: HeroLetterProps) {
    const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

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
                style={{ objectFit: 'cover' }}
            />

            {/* Gradient overlay for extra text legibility */}
            <div
                className="absolute inset-0 z-[1]"
                style={{
                    background: 'linear-gradient(to top, rgba(20,10,5,0.85) 0%, rgba(20,10,5,0.2) 60%, transparent 100%)',
                }}
            />

            {/* Content */}
            <div className="hero-letter-content">
                <div className="flex flex-wrap gap-4 items-center mb-6">
                    <time className="caption opacity-80 text-[var(--paper)]" dateTime={date}>
                        {formattedDate}
                    </time>
                    <span className="ethiopic text-sm opacity-60 text-[var(--paper)] tracking-wider">
                        ሳምንት {title.match(/Semaine\s+(\d+)/)?.[1] || ""}
                    </span>
                    {location && (
                        <span className="caption text-[#C9A84C]">{location}</span>
                    )}
                    <span className="read-time" style={{ color: '#FDFAF6', borderColor: 'rgba(255,255,255,0.3)' }}>
                        ⏱ {readTime} min
                    </span>
                </div>

                <h1 className="mb-6" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
                    {title}
                </h1>

                {excerpt && (
                    <p
                        className="text-lg italic opacity-85 max-w-prose leading-relaxed"
                        style={{ fontFamily: 'var(--font-lora), serif', color: '#FDFAF6' }}
                    >
                        {excerpt}
                    </p>
                )}
            </div>
        </div>
    );
}
