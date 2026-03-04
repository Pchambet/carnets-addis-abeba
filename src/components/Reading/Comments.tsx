'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function Comments({ id, title }: { id: string; title: string }) {
    const pathname = usePathname();
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!wrapperRef.current) return;

        // Clear wrapper for client-side navigations
        wrapperRef.current.innerHTML = '';

        // 1. Create the Cusdis container
        const cusdisDiv = document.createElement('div');
        cusdisDiv.id = 'cusdis_thread';
        cusdisDiv.dataset.host = 'https://cusdis.com';
        cusdisDiv.dataset.appId = 'e5deb779-2d3a-4380-a2ca-bec214a584eb';
        cusdisDiv.dataset.pageId = id;
        cusdisDiv.dataset.pageUrl = `https://carnets-addis-abeba.vercel.app${pathname}`;
        cusdisDiv.dataset.pageTitle = title;
        cusdisDiv.dataset.theme = 'light';
        cusdisDiv.style.minHeight = '300px';

        wrapperRef.current.appendChild(cusdisDiv);

        // 2. Inject the script dynamically
        const script = document.createElement('script');
        script.src = 'https://cusdis.com/js/cusdis.es.js';
        script.async = true;
        script.defer = true;

        wrapperRef.current.appendChild(script);

        return () => {
            if (wrapperRef.current) {
                wrapperRef.current.innerHTML = '';
            }
        };
    }, [id, pathname, title]);

    return (
        <section className="max-w-4xl mx-auto px-6 md:px-12 py-12 border-t border-[var(--border)] mt-12 bg-white/30 rounded-3xl">
            <h2 className="text-center text-[var(--ochre)] mb-8 text-3xl font-[family-name:var(--font-cormorant)] italic">
                Livre d'or & Commentaires
            </h2>
            <div ref={wrapperRef} className="w-full" />
            <p className="caption text-center mt-6 text-[var(--ink-light)] opacity-70">
                Laissez un mot à Claire ! Pas besoin de compte, juste votre prénom.
            </p>
        </section>
    );
}
