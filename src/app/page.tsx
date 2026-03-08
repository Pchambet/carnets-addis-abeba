import { getSortedLettersData } from '@/lib/letters';
import Link from 'next/link';
import Image from 'next/image';

const HOME_HERO_IMAGE = '/images/home-hero.jpg';

export default function Home() {
    const letters = getSortedLettersData();

    return (
        <div>
            {/* ── Hero pleine largeur (IMG_1206) ── */}
            <section className="hero-letter home-hero border-b border-[var(--border)]">
                <Image
                    src={HOME_HERO_IMAGE}
                    alt="Addis-Abeba — La Nouvelle Fleur"
                    fill
                    className="hero-letter-bg"
                    priority
                    sizes="100vw"
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
                        Addis-Abeba, Éthiopie · {new Date().getFullYear()}
                    </p>
                    <h2 className="text-4xl md:text-6xl font-light leading-tight mb-6 max-w-2xl" style={{ color: '#FDFAF6', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
                        Nouvelles hebdomadaires<br />
                        <em className="text-[#C9A84C]">depuis La Nouvelle Fleur</em>
                    </h2>
                    <p className="text-lg max-w-prose leading-loose font-[family-name:var(--font-lora)] opacity-90" style={{ color: '#FDFAF6' }}>
                        Une lettre par semaine d’un voyage Éthiopien.
                    </p>
                </div>
            </section>

            {/* ── Letter List ── */}
            <section className="max-w-4xl mx-auto px-6 md:px-12 py-24">
                {letters.length === 0 ? (
                    <p className="text-[var(--ink-light)] italic">Aucune lettre pour l&apos;instant.</p>
                ) : (
                    <ul className="divide-y divide-[var(--border)]">
                        {letters.map(({ id, date, title, location, excerpt }) => {
                            const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            });

                            return (
                                <li key={id} className="group">
                                    <Link href={`/letters/${id}`} className="no-underline hover:no-underline block py-12 md:py-16">
                                        <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-10">

                                            {/* Date column */}
                                            <div className="md:w-44 flex-shrink-0">
                                                <time className="caption text-[var(--ink-light)]" dateTime={date}>
                                                    {formattedDate}
                                                </time>
                                                {location && (
                                                    <p className="caption text-[var(--red)] mt-1">{location}</p>
                                                )}
                                            </div>

                                            {/* Content column */}
                                            <div className="flex-1">
                                                <h2 className="text-2xl md:text-3xl font-light text-[var(--ink)] group-hover:text-[var(--ochre)] transition-colors duration-500 mb-4">
                                                    {title}
                                                </h2>
                                                {excerpt && (
                                                    <p className="text-[var(--ink-light)] font-[family-name:var(--font-lora)] italic leading-relaxed">
                                                        « {excerpt} »
                                                    </p>
                                                )}
                                                <span className="caption text-[var(--ochre)] mt-6 inline-block group-hover:underline transition-all duration-300">
                                                    Lire la lettre →
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}
