'use client';
import { useEffect } from 'react';

export default function ReadingProgress() {
    useEffect(() => {
        const bar = document.getElementById('reading-progress');
        if (!bar) return;

        const update = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = `${Math.min(100, progress)}%`;
        };

        window.addEventListener('scroll', update, { passive: true });
        return () => window.removeEventListener('scroll', update);
    }, []);

    return <div id="reading-progress" aria-hidden="true" />;
}
