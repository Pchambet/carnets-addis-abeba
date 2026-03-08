import Link from 'next/link';

interface Letter {
    id: string;
    date: string;
    title: string;
    location?: string;
    excerpt?: string;
}

interface TimelineProps {
    letters: Letter[];
}

export default function Timeline({ letters }: TimelineProps) {
    if (letters.length === 0) {
        return (
            <p className="text-[var(--ink-light)] italic">Aucune lettre pour l&apos;instant.</p>
        );
    }

    return (
        <div className="relative">
            {/* Ligne verticale connectant tous les points */}
            <div
                className="absolute left-[0.4rem] top-6 bottom-6 w-px bg-[var(--ochre)] opacity-25"
                aria-hidden
            />

            <ul>
                {letters.map(({ id, date, title, location, excerpt }) => {
                    const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    });

                    return (
                        <li key={id} className="group relative border-b border-[var(--border)] last:border-b-0">
                            <Link href={`/letters/${id}`} className="no-underline hover:no-underline block py-12 md:py-16 pl-8">
                                {/* Point sur la timeline */}
                                <div
                                    className="absolute left-0 top-14 md:top-16 w-3 h-3 rounded-full border-2 border-[var(--ochre)] bg-[var(--paper)] opacity-80 group-hover:opacity-100 group-hover:bg-[var(--ochre)] group-hover:scale-125 transition-all duration-300"
                                    aria-hidden
                                />

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
        </div>
    );
}
