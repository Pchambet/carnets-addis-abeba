import { getSortedLettersData } from '@/lib/letters';
import Timeline from '@/components/Home/Timeline';

export default function Home() {
    const letters = getSortedLettersData();

    return (
        <div>
            {/* ── Hero pleine largeur, responsive (IMG_1206) ── */}
            <section className="hero-letter home-hero border-b border-[var(--border)]">
                <img
                    src="/images/home-hero.jpg"
                    srcSet="/images/home-hero-640.jpg 640w, /images/home-hero-1024.jpg 1024w, /images/home-hero.jpg 2000w"
                    sizes="100vw"
                    alt="Addis-Abéba — La Nouvelle Fleur"
                    className="hero-letter-bg"
                    loading="eager"
                    fetchPriority="high"
                    style={{ objectFit: 'cover' }}
                />
                <div
                    className="absolute inset-0 z-[1]"
                    style={{
                        background: 'linear-gradient(to top, rgba(20,10,5,0.75) 0%, rgba(20,10,5,0.18) 60%, transparent 100%)',
                    }}
                />
                <div className="hero-letter-content">
                    <p className="caption mb-6" style={{ color: '#FDFAF6', opacity: 0.95, textShadow: '0 1px 8px rgba(0,0,0,0.5), 0 2px 2px rgba(0,0,0,0.3)' }}>
                        Addis-Abéba, Éthiopie · {new Date().getFullYear()}
                    </p>
                    <h2 className="text-2xl sm:text-4xl md:text-6xl font-light leading-tight mb-6 max-w-2xl" style={{ color: '#FDFAF6', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
                        Nouvelles hebdomadaires<br />
                        <em className="text-[#C9A84C]">depuis La Nouvelle Fleur</em>
                    </h2>
                    <p className="text-base sm:text-lg max-w-prose leading-loose font-[family-name:var(--font-lora)] opacity-90" style={{ color: '#FDFAF6' }}>
                        « Une lettre hebdomadaire d’un voyage en Éthiopie »
                    </p>
                </div>
            </section>

            {/* ── Timeline des lettres ── */}
            <section className="max-w-4xl mx-auto px-6 md:px-12 py-24">
                <Timeline letters={letters} />
            </section>
        </div>
    );
}
