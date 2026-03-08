import TibebDivider from '@/components/UI/TibebDivider';

export default function AboutPage() {
    return (
        <div>
            {/* ── Bio ── */}
            <article className="px-6 md:px-12 py-12">
                <div className="reading-width mx-auto">
                    <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-cormorant)] font-light italic text-[var(--ochre)] mb-16 tracking-tight">
                        Aux lecteurs
                    </h2>

                    <p className="drop-cap text-[var(--ink)] font-[family-name:var(--font-lora)] leading-[2] text-lg mb-8">
                        Arrivée le 25 octobre 2025 à Addis-Abéba, capitale de l’Éthiopie, pour une mission solidaire d’un an avec l’Oeuvre-d’Orient, le désir d’écrire les désillusions et les enchantements propres aux découvertes qu’offre la singularité de ce nouveau pays, a tout de suite fait retentir son appel.
                    </p>

                    <p className="text-[var(--ink)] font-[family-name:var(--font-lora)] leading-[2] text-lg mb-8">
                        Dès les premières heures, une plongée dans un nouveau monde s’est engagée pour s’approfondir au fil des jours.
                    </p>

                    <p className="text-[var(--ink)] font-[family-name:var(--font-lora)] leading-[2] text-lg mb-8">
                        En commençant la mission, les épreuves du voyage, l’éloignement avec la douceur des habitudes familières et des proches s’est alors fait sentir, parfois douloureusement. Pour dépasser le chagrin, l’écriture a permis de chercher à garder un regard d’émerveillement sur les choses qui s’offrent quotidiennement.
                    </p>

                    <p className="text-[var(--ink)] font-[family-name:var(--font-lora)] leading-[2] text-lg mb-8">
                        C’est ce qui est partagé ici, de manière hebdomadaire.
                    </p>

                    <p className="text-[var(--ink)] font-[family-name:var(--font-lora)] leading-[2] text-lg mb-8">
                        Au bout de quelques semaines, un bon ami s’est proposé de m’aider à publier ces écrits pour en garder la trace, peut-être au-delà, pour une invitation aux voyages, aux contemplations et au don de soi comme le propose cet engagement d’un an auprès d’enfants blessés.
                    </p>

                    <p className="text-[var(--ink)] font-[family-name:var(--font-lora)] leading-[2] text-lg mb-8">
                        Ces lettres racontent les pesanteurs et les grâces qu’offrent cet engagement solidaire, les petits bonheurs ordinaires et les rencontres avec les merveilles que cette Éthiopie mystérieuse veut bien donner à voir.
                    </p>

                    <p className="text-[var(--ink)] font-[family-name:var(--font-lora)] leading-[2] text-lg mb-8">
                        Alors je vous souhaite un beau voyage au fil de vos lectures. Puissent-elles vous offrir une parenthèse hebdomadaire, pourquoi pas les dimanches soirs, après le flot de votre semaine, lorsqu’une nouvelle lettre s’envoie.
                    </p>

                    <p className="signature">
                        Claire
                    </p>
                </div>
            </article>

            <TibebDivider />

            {/* ── Three pillars reminder ── */}
            <section className="px-6 md:px-12 py-16">
                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-12">
                    <div>
                        <p className="caption text-[var(--ochre)] mb-3">🕊️ Spirituel</p>
                        <p className="text-[var(--ink-light)] font-[family-name:var(--font-lora)] italic text-base leading-relaxed">
                            Prendre le temps. Ralentir la lecture. Laisser les mots agir doucement.
                        </p>
                    </div>
                    <div>
                        <p className="caption text-[var(--red)] mb-3">🌍 Culturel</p>
                        <p className="text-[var(--ink-light)] font-[family-name:var(--font-lora)] italic text-base leading-relaxed">
                            Partir à la rencontre d&apos;une culture vivante, vibrante, spirituelle.
                        </p>
                    </div>
                    <div>
                        <p className="caption text-[var(--gold)] mb-3">🤝 Solidaire</p>
                        <p className="text-[var(--ink-light)] font-[family-name:var(--font-lora)] italic text-base leading-relaxed">
                            Ces lettres créent un lien. Elles vous invitent à écrire, à partager.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="text-center py-16 px-6 border-t border-[var(--border)]">
                <p className="caption text-[var(--ink-light)] mb-4">Un mot à faire passer ?</p>
                <a
                    href="mailto:claire.stellio@gmail.com?subject=Je t&apos;écris depuis le site"
                    className="inline-block border border-[var(--ochre)] text-[var(--ochre)] px-10 py-4 caption hover:bg-[var(--ochre)] hover:text-[var(--white)] transition-all duration-500 no-underline"
                >
                    Envoyer un message
                </a>
            </section>
        </div>
    );
}
