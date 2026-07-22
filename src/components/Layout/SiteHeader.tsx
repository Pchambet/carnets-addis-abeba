"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SiteHeader() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [isAtTop, setIsAtTop] = useState(true);
    const lastScrollY = useRef(0);

    const controlNavbar = useCallback(() => {
        if (typeof window !== 'undefined') {
            const currentScrollY = window.scrollY;

            // Define "at top" state for glassmorphism
            if (currentScrollY < 10) {
                setIsAtTop(true);
            } else {
                setIsAtTop(false);
            }

            // Hide/Show based on scroll direction
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                // Scrolling down -> hide
                setIsVisible(false);
            } else {
                // Scrolling up -> show
                setIsVisible(true);
            }

            lastScrollY.current = currentScrollY;
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', controlNavbar, { passive: true });
            return () => {
                window.removeEventListener('scroll', controlNavbar);
            };
        }
    }, [controlNavbar]);

    const navLinks = [
        { name: 'Lettres', href: '/' },
        { name: 'Galerie', href: '/galerie' },
        { name: 'Jardin', href: '/jardin' },
        { name: 'Carte', href: '/carte' },
        { name: 'À propos', href: '/about' },
    ];

    return (
        <header 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-6 md:py-8 px-6 md:px-12 border-b ${
                isVisible ? 'translate-y-0' : '-translate-y-full'
            } ${
                isAtTop 
                    ? 'bg-[#f7f5f0]/95 backdrop-blur-none border-[var(--border)] sm:bg-transparent sm:border-transparent' 
                    : 'bg-[#f7f5f0]/80 backdrop-blur-md border-[var(--border)] shadow-sm'
            }`}
        >
            <div className="max-w-4xl mx-auto flex justify-between items-baseline gap-6 flex-col sm:flex-row">
                <Link href="/" className="no-underline hover:no-underline block transition-opacity duration-250 hover:opacity-80 shrink-0">
                    <h1 className="text-2xl md:text-3xl font-normal sm:font-light mt-1 text-[var(--ink)] leading-tight">
                        La Parenthèse<br />
                        <em className="text-[var(--ochre)]">du dimanche soir</em>
                    </h1>
                </Link>

                {/* Mobile scrollable nav wrapper */}
                <nav 
                    className="flex gap-5 sm:gap-8 caption text-[var(--ink-light)] w-full sm:w-auto overflow-x-auto overflow-y-hidden scrollbar-hide pb-2 sm:pb-0"
                    aria-label="Navigation principale"
                >
                    {navLinks.map((link) => {
                        // Check active state
                        // Special case for '/' since it matches all paths if we just use startsWith
                        const isActive = link.href === '/' 
                            ? pathname === '/' 
                            : pathname.startsWith(link.href) && link.href !== '/';

                        return (
                            <Link 
                                key={link.href} 
                                href={link.href} 
                                className={`relative transition-colors duration-250 whitespace-nowrap px-1 py-1 ${
                                    isActive 
                                        ? 'text-[var(--ochre)] font-medium' 
                                        : 'hover:text-[var(--ochre)] opacity-80 hover:opacity-100'
                                }`}
                            >
                                {link.name}
                                {/* Active indicator underline */}
                                {isActive && (
                                    <span 
                                        className="absolute left-0 right-0 bottom-0 h-[1px] bg-[var(--ochre)] rounded-full"
                                        aria-hidden="true"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
