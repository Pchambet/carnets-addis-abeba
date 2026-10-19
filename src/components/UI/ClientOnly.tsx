'use client';

import { useEffect, useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * Rendu dans le navigateur seulement. Pour la galerie : les albums ne connaissent leur largeur
 * qu'une fois montés ; rendus d'un bloc, ils ne décalent pas la page section par section.
 * scrollToHash : l'ancre de l'adresse (/galerie/#semaine-12) n'existe qu'après ce rendu.
 */
export default function ClientOnly({ children, scrollToHash = false }: { children: React.ReactNode; scrollToHash?: boolean }) {
    const isClient = useSyncExternalStore(subscribe, () => true, () => false);

    useEffect(() => {
        if (isClient && scrollToHash && location.hash) {
            document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
        }
    }, [isClient, scrollToHash]);

    return isClient ? children : null;
}
