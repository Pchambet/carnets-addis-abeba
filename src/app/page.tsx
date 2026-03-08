import { getSortedLettersData } from '@/lib/letters';
import Link from 'next/link';

export default function Home() {
    const letters = getSortedLettersData();

    return (
        <div>
            {/* ── Hero / Masthead ── */}
            <section className="px-6 md:px-12 py-24 md:py-36 border-b border-[var(--border)]">
                <div className="max-w-4xl mx-auto">
                    <p className="caption text-[var(--ochre)] mb-6">
                        Addis-Abeba, Éthiopie · {new Date().getFullYear()}
                    </p>
                    <h2 className="text-4xl md:text-6xl font-light leading-tight text-[var(--ink)] mb-10 max-w-2xl">
                        Nouvelles hebdomadaires<br />
                        <em className="text-[var(--ochre)]">depuis La Nouvelle Fleur</em>
                    </h2>
                    <p className="text-lg text-[var(--ink-light)] max-w-prose leading-loose font-[family-name:var(--font-lora)]">
                        Une lettre par semaine d’un voyage Éthiopien.
                    </p>
                </div>
            </section>

            {/* ── Letter List ── */}
            <section className="max-w-4xl mx-auto px-6 md:px-12 py-24">
                {letters.length === 0 ? (
                    <p className="text-[var(--ink-light)] italic">Aucune lettre pour l'instant.</p>
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
