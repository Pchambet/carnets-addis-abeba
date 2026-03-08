'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Comments({ id, title }: { id: string; title: string }) {
    const pathname = usePathname();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        setLoading(true);
        setError(false);
        wrapper.innerHTML = '';

        // pageUrl avec trailing slash (cohérent avec next.config)
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://carnets-addis-abeba.vercel.app';
        const normalizedPath = pathname.endsWith('/') ? pathname : `${pathname}/`;
        const pageUrl = `${siteUrl}${normalizedPath}`;

        const cusdisDiv = document.createElement('div');
        cusdisDiv.id = 'cusdis_thread';
        cusdisDiv.dataset.host = 'https://cusdis.com';
        cusdisDiv.dataset.appId = 'e5deb779-2d3a-4380-a2ca-bec214a584eb';
        cusdisDiv.dataset.pageId = id;
        cusdisDiv.dataset.pageUrl = pageUrl;
        cusdisDiv.dataset.pageTitle = title;
        cusdisDiv.dataset.theme = 'light';
        cusdisDiv.style.minHeight = '300px';

        wrapper.appendChild(cusdisDiv);

        const script = document.createElement('script');
        script.src = 'https://cusdis.com/js/cusdis.es.js';
        script.async = true;
        script.defer = true;
        script.onload = () => setLoading(false);
        script.onerror = () => {
            setError(true);
            setLoading(false);
        };

        wrapper.appendChild(script);

        return () => {
            wrapper.innerHTML = '';
        };
    }, [id, pathname, title]);

    return (
        <section className="max-w-4xl mx-auto px-6 md:px-12 py-12 mt-16">
            <h2 className="text-xl font-[family-name:var(--font-cormorant)] font-light text-[var(--ink)] mb-6">
                Livre d&apos;or
            </h2>
            <div className="relative min-h-[200px]">
                <div ref={wrapperRef} className="w-full" />
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="caption text-[var(--ink-light)] opacity-60">
                            Chargement…
                        </p>
                    </div>
                )}
            </div>
            {error && (
                <p className="caption text-[var(--ink-light)] opacity-70 mt-4">
                    Les commentaires ne sont pas disponibles pour le moment.
                </p>
            )}
        </section>
    );
}
