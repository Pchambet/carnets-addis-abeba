import Image from 'next/image';
import Link from 'next/link';
import { ETHIOPIC_WEEK, weekLabel } from '@/lib/letters';

interface Letter {
    id: string;
    date: string;
    title: string;
    location?: string;
    excerpt?: string;
    cover?: string;
}

interface TimelineProps {
    letters: Letter[];
}

/** Le voyage, de la lettre la plus récente à la première : semaine, lieu, photo, extrait. */
export default function Timeline({ letters }: TimelineProps) {
    if (letters.length === 0) {
        return (
            <p className="text-[var(--ink-light)] italic">Aucune lettre pour l’instant.</p>
        );
    }

    return (
        <div className="relative">
            {/* Le fil du voyage */}
            <div className="absolute left-[0.35rem] top-8 bottom-8 w-px bg-[var(--ochre)] opacity-25" aria-hidden />
            <ol>

            {letters.map(({ id, date, title, location, excerpt, cover }) => {
                const week = weekLabel(id);
                const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });

                return (
                    <li key={id} className="group relative border-b border-[var(--border)] last:border-b-0">
                        <Link href={`/letters/${id}`} className="no-underline hover:no-underline grid gap-6 md:gap-10 py-12 md:py-14 pl-8 md:grid-cols-[11rem_1fr_13rem]">
                            <span
                                className="absolute left-0 top-[3.6rem] md:top-[4.1rem] w-3 h-3 rounded-full border-2 border-[var(--ochre)] bg-[var(--paper)] group-hover:bg-[var(--ochre)] transition-colors duration-300"
                                aria-hidden
                            />

                            <div className="flex flex-wrap md:flex-col gap-x-4 gap-y-1 items-baseline">
                                {week && (
                                    <span className="font-[family-name:var(--font-cormorant)] text-xl text-[var(--ochre)]">
                                        <span className="ethiopic">{ETHIOPIC_WEEK}</span> {week}
                                    </span>
                                )}
                                <time className="caption" dateTime={date}>{formattedDate}</time>
                                {location && <span className="caption text-[var(--red)]">{location}</span>}
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-2xl md:text-3xl font-light text-[var(--ink)] group-hover:text-[var(--ochre)] transition-colors duration-300 mb-4">
                                    {title}
                                </h2>
                                {excerpt && (
                                    <p className="text-[var(--ink-light)] font-[family-name:var(--font-lora)] italic leading-relaxed">
                                        « {excerpt} »
                                    </p>
                                )}
                                <span className="caption text-[var(--ochre)] mt-6 inline-block group-hover:underline underline-offset-4">
                                    Lire la lettre
                                </span>
                            </div>

                            {cover && (
                                <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-[var(--border)] md:order-none -order-1 md:mt-1">
                                    <Image
                                        src={cover}
                                        alt=""
                                        fill
                                        sizes="(min-width: 768px) 13rem, 100vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                        style={{ filter: 'contrast(1.02) saturate(0.93)' }}
                                    />
                                </div>
                            )}
                        </Link>
                    </li>
                );
            })}
            </ol>
        </div>
    );
}
