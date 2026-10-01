"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
    { name: 'Lettres', href: '/' },
    { name: 'Galerie', href: '/galerie' },
    { name: 'Jardin', href: '/jardin' },
    { name: 'Carte', href: '/carte' },
    { name: 'À propos', href: '/about' },
];

function isActive(pathname: string, href: string): boolean {
    return href === '/' ? pathname === '/' || pathname.startsWith('/letters') : pathname.startsWith(href);
}

export default function SiteHeader() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [isAtTop, setIsAtTop] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const lastScrollY = useRef(0);

    // Masqué en descendant, réaffiché en remontant
    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            setIsAtTop(y < 10);
            setIsVisible(y <= lastScrollY.current || y <= 100);
            lastScrollY.current = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // position restaurée par le navigateur (rechargement, ancre)
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Menu mobile : se ferme avec Échap ou au choix d'un lien
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [menuOpen]);

    const solid = !isAtTop || menuOpen;

    return (
        <header
            data-transparent={isAtTop && !menuOpen}
            className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ease-in-out ${
                isVisible || menuOpen ? 'translate-y-0' : '-translate-y-full'
            } ${
                solid
                    ? 'bg-[var(--white)]/90 backdrop-blur-md border-[var(--border)] shadow-sm'
                    : 'bg-[var(--white)]/90 border-[var(--border)] sm:bg-transparent sm:border-transparent'
            }`}
        >
            <div className="site-container flex justify-between items-center gap-6 py-4 sm:py-7">
                <Link href="/" className="no-underline hover:no-underline block transition-opacity duration-250 hover:opacity-80 shrink-0">
                    <span className="block font-[family-name:var(--font-cormorant)] text-xl sm:text-3xl font-normal sm:font-light text-[var(--ink)] leading-tight">
                        La Parenthèse<br />
                        <em className="text-[var(--ochre)]">du dimanche soir</em>
                    </span>
                </Link>

                <nav aria-label="Navigation principale">
                    <button
                        type="button"
                        className="sm:hidden caption text-[var(--ink)] px-3 py-2 -mr-3"
                        aria-expanded={menuOpen}
                        aria-controls="site-menu"
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        {menuOpen ? 'Fermer' : 'Menu'}
                    </button>

                    <ul
                        id="site-menu"
                        className={`${menuOpen ? 'flex' : 'hidden'} sm:flex absolute sm:static left-0 right-0 top-full flex-col sm:flex-row gap-0 sm:gap-8 bg-[var(--white)] sm:bg-transparent border-b sm:border-0 border-[var(--border)] px-6 pb-4 sm:p-0`}
                    >
                        {NAV_LINKS.map((link) => {
                            const active = isActive(pathname, link.href);
                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        aria-current={active ? 'page' : undefined}
                                        onClick={() => setMenuOpen(false)}
                                        className={`caption relative block whitespace-nowrap py-3 sm:py-1 sm:px-1 no-underline border-b sm:border-0 border-[var(--border)] transition-colors duration-250 ${
                                            active ? 'text-[var(--ochre)]' : 'text-[var(--ink-light)] hover:text-[var(--ochre)]'
                                        }`}
                                    >
                                        {link.name}
                                        {active && (
                                            <span className="hidden sm:block absolute left-0 right-0 bottom-0 h-px bg-[var(--ochre)]" aria-hidden="true" />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
