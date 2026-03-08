'use client';
import { useEffect, useRef } from 'react';

export default function ReadingProgress() {
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const bar = document.getElementById('reading-progress');
        if (!bar) return;

        const update = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = `${Math.min(100, progress)}%`;
            rafRef.current = null;
        };

        const onScroll = () => {
            if (rafRef.current === null) {
                rafRef.current = requestAnimationFrame(update);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        update(); // Initial state
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return <div id="reading-progress" aria-hidden="true" />;
}
