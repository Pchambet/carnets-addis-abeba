'use client';
import { useEffect, useRef } from 'react';

export default function ReadingProgress() {
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const bar = document.getElementById('reading-progress');
        const letter = document.getElementById('lettre');
        if (!bar || !letter) return;

        // Progression dans la lettre elle-même (pas la galerie ni le livre d'or) ;
        // scaleX ne déclenche pas de recalcul de mise en page
        const update = () => {
            const { top, height } = letter.getBoundingClientRect();
            const scrollable = height - window.innerHeight;
            // Lettre plus courte que l'écran : finie quand elle est entièrement visible
            const progress = scrollable > 0
                ? Math.min(1, Math.max(0, -top / scrollable))
                : Number(top + height <= window.innerHeight);
            bar.style.transform = `scaleX(${progress})`;
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
