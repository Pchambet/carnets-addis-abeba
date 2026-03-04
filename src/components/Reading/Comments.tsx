'use client';

import { useEffect, useRef } from 'react';

export default function Comments() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current || ref.current.hasChildNodes()) return;

        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.async = true;
        script.crossOrigin = 'anonymous';

        // Giscus configuration
        script.setAttribute('data-repo', 'Pchambet/carnets-addis-abeba');
        script.setAttribute('data-repo-id', 'R_kgDOReFf0Q');
        script.setAttribute('data-category', 'General');
        script.setAttribute('data-category-id', 'DIC_kwDOReFf0c4C3q-y');
        script.setAttribute('data-strict', '0');
        script.setAttribute('data-reactions-enabled', '1');
        script.setAttribute('data-emit-metadata', '0');
        script.setAttribute('data-input-position', 'top');
        script.setAttribute('data-theme', 'light');
        script.setAttribute('data-lang', 'fr');
        script.setAttribute('data-loading', 'lazy');

        ref.current.appendChild(script);
    }, []);

    return (
        <section className="max-w-4xl mx-auto px-6 md:px-12 py-12 border-t border-[var(--border)] mt-12 bg-white/30 rounded-3xl">
            <h2 className="text-center text-[var(--ochre)] mb-8 text-3xl font-[family-name:var(--font-cormorant)] italic">Livre d'or & Commentaires</h2>
            <div ref={ref} className="giscus-container" />
        </section>
    );
}
