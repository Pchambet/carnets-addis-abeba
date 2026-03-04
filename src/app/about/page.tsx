import TibebDivider from '@/components/UI/TibebDivider';

export default function AboutPage() {
    return (
        <div>
            {/* ── Header ── */}
            <section className="px-6 md:px-12 py-20 md:py-28 border-b border-[var(--border)]">
                <div className="max-w-4xl mx-auto">
                    <p className="caption text-[var(--ochre)] mb-4">La lettre</p>
                    <h1 className="text-4xl md:text-6xl font-light leading-tight">
                        À propos<br />
                        <em className="text-[var(--ochre)]">de Claire.</em>
                    </h1>
                </div>
            </section>

            <TibebDivider />

            {/* ── Bio ── */}
            <article className="px-6 md:px-12 py-12">
                <div className="reading-width mx-auto">

                    <p className="drop-cap text-[var(--ink)] font-[family-name:var(--font-lora)] leading-[2] text-lg mb-8">
                        Claire vit à Addis-Abeba, en Éthiopie, où elle s'est engagée comme volontaire
                        auprès de communautés religieuses et d'enfants en difficulté. Enseignante d'anglais,
                        musicienne de jazz, et témoin d'un quotidien à la fois lumineux et bouleversant,
                        elle écrit depuis le terrain des chroniques qui racontent la beauté et la dureté
                        de la vie en Éthiopie.
                    </p>

                    <p className="text-[var(--ink)] font-[family-name:var(--font-lora)] leading-[2] text-lg mb-8">
                        Ses lettres ne sont pas des carnets de voyage ordinaires. Ce sont des fragments
                        de vie — des rencontres avec des peintres, des soirées jazz dans des hôtels d'Addis,
                        des prières chantées dans des chapelles, des enfants qui apprennent l'anglais avec
                        passion, et des mourants à qui elle offre des chansons.
                    </p>

                    {/* Pull quote */}
                    <blockquote className="pull-quote not-prose">
                        &laquo;&thinsp;Je vous souhaite de saisir les joies simples que la nature ne cesse de
                        nous proposer et le courage d'offrir un sourire à un passant solitaire.&thinsp;&raquo;
                    </blockquote>

                    <p className="text-[var(--ink)] font-[family-name:var(--font-lora)] leading-[2] text-lg">
                        Ces chroniques sont publiées ici au fil de l'eau, telles quelles, sans filtre —
                        comme des lettres d'une amie qui raconte sa vie loin de tout.
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
                            Partir à la rencontre d'une culture vivante, vibrante, spirituelle.
                        </p>
                    </div>
                    <div>
                        <p className="caption text-[var(--gold)] mb-3">🤝 Solidaire</p>
                        <p className="text-[var(--ink-light)] font-[family-name:var(--font-lora)] italic text-base leading-relaxed">
                            Ces lettres créent un lien. Elles vous invitent à écrire à Claire, à partager.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="text-center py-16 px-6 border-t border-[var(--border)]">
                <p className="caption text-[var(--ink-light)] mb-4">Envie d'écrire à Claire ?</p>
                <a
                    href="mailto:claire.stellio@gmail.com?subject=Je t'écris depuis ton site"
                    className="inline-block border border-[var(--ochre)] text-[var(--ochre)] px-10 py-4 caption hover:bg-[var(--ochre)] hover:text-[var(--white)] transition-all duration-500 no-underline"
                >
                    Écrire à Claire
                </a>
            </section>
        </div>
    );
}
