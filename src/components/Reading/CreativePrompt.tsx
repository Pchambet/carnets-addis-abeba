'use client';
import { useState } from 'react';

const PROMPTS = [
    "Qu'est-ce qui t'a été donné à voir de beau cette semaine ?",
    "Qu'est-ce que tu souhaiterais ramener chez toi de l'esprit de l'Éthiopie ?",
    "Écris une pensée, une image, un instant de ta semaine.",
    "Qu'est-ce qui t'invite à ralentir, en ce moment ?",
    "Qu'est-ce que tu as savouré comme un morceau de chocolat, ces derniers jours ?",
];

export default function CreativePrompt() {
    const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    const [text, setText] = useState('');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        if (text.trim()) {
            setSaved(true);
            setTimeout(() => setSaved(false), 4000);
        }
    };

    return (
        <section className="my-24 px-4">
            <div
                className="max-w-xl mx-auto border border-[var(--border)] bg-[var(--white)] p-10 md:p-14"
                style={{ boxShadow: '4px 4px 0 #DDD5C8' }}
            >
                {/* Heading */}
                <p className="caption text-[var(--ochre)] mb-6">Un espace pour toi</p>
                <h3 className="text-2xl md:text-3xl font-light italic text-[var(--ink)] mb-8 leading-snug">
                    {prompt}
                </h3>

                {/* Textarea */}
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    rows={5}
                    placeholder="Laisse venir ce qui vient…"
                    className="w-full bg-transparent border-b border-[var(--border)] focus:border-[var(--ochre)] outline-none resize-none text-[var(--ink)] font-[family-name:var(--font-lora)] text-base leading-loose placeholder:text-[var(--border)] transition-colors duration-300"
                />

                <div className="flex justify-between items-center mt-8">
                    <p className="caption text-[var(--ink-light)] text-xs">
                        Ces mots restent sur ton écran, ils sont pour toi.
                    </p>
                    <button
                        onClick={handleSave}
                        className="caption text-[var(--ochre)] border border-[var(--ochre)] px-5 py-2 hover:bg-[var(--ochre)] hover:text-[var(--white)] transition-all duration-500"
                    >
                        {saved ? '✓ Gardé' : 'Garder'}
                    </button>
                </div>
            </div>
        </section>
    );
}
