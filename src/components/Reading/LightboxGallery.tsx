'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Photo {
    src: string;
    name: string;
    caption?: string;
}

interface LightboxGalleryProps {
    photos: Photo[];
}

export default function LightboxGallery({ photos }: LightboxGalleryProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // Lock body scroll when open
    useEffect(() => {
        if (activeIndex !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [activeIndex]);

    const handlePrev = useCallback(() => {
        setActiveIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
    }, [photos.length]);

    const handleNext = useCallback(() => {
        setActiveIndex((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
    }, [photos.length]);

    // Keyboard navigation
    useEffect(() => {
        if (activeIndex === null) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setActiveIndex(null);
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeIndex, handlePrev, handleNext]);

    return (
        <>
            {/* ── Photo Grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {photos.map((photo, i) => (
                    <figure key={i} className="group">
                        <button
                            type="button"
                            className="relative aspect-square overflow-hidden bg-[var(--border)] cursor-zoom-in w-full text-left active:scale-[0.99] transition-transform duration-200"
                            title={photo.caption ?? photo.name}
                            onClick={() => setActiveIndex(i)}
                            aria-label={`Voir la photo : ${photo.caption ?? photo.name}`}
                        >
                            <Image
                                src={photo.src}
                                alt={photo.caption ?? photo.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                                sizes="(max-width: 768px) 50vw, 25vw"
                                style={{ filter: 'contrast(1.02) saturate(0.93)' }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" aria-hidden />
                        </button>
                        {photo.caption && (
                            <figcaption className="mt-2 text-xs text-[var(--ink-light)] italic font-[family-name:var(--font-lora)] line-clamp-2">
                                {photo.caption}
                            </figcaption>
                        )}
                    </figure>
                ))}
            </div>

            {/* ── Fullscreen Lightbox Overlay ── */}
            <AnimatePresence>
                {activeIndex !== null && (
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Galerie photo en plein écran"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center overscroll-none"
                    >
                        {/* ── Close Button ── */}
                        <button
                            onClick={() => setActiveIndex(null)}
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[120] text-white/50 hover:text-white transition-colors p-3 sm:p-4 cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black touch-manipulation"
                            aria-label="Fermer"
                        >
                            <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* ── Next/Prev Areas ── */}
                        <button
                            className="absolute left-0 top-0 bottom-0 w-16 sm:w-[20vw] min-w-[48px] z-[110] flex items-center justify-start pl-2 sm:pl-6 md:pl-12 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset cursor-w-resize touch-manipulation"
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            aria-label="Précédent"
                        >
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-white/20 group-hover:text-white/80 transition-colors duration-300"
                            >
                                <svg className="w-12 h-12 md:w-16 md:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M15 19l-7-7 7-7" />
                                </svg>
                            </motion.div>
                        </button>

                        <button
                            className="absolute right-0 top-0 bottom-0 w-16 sm:w-[20vw] min-w-[48px] z-[110] flex items-center justify-end pr-2 sm:pr-6 md:pr-12 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset cursor-e-resize touch-manipulation"
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            aria-label="Suivant"
                        >
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-white/20 group-hover:text-white/80 transition-colors duration-300"
                            >
                                <svg className="w-12 h-12 md:w-16 md:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </motion.div>
                        </button>

                        {/* ── Image Container ── */}
                        <div
                            className="relative w-full h-full max-w-[95vw] sm:max-w-[90vw] max-h-[80vh] sm:max-h-[85vh] flex items-center justify-center p-2 sm:p-4"
                            onClick={() => setActiveIndex(null)} // Click outside to close
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02 }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    className="relative w-full h-full flex items-center justify-center shadow-2xl"
                                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
                                >
                                    <Image
                                        src={photos[activeIndex].src}
                                        alt={photos[activeIndex].caption ?? photos[activeIndex].name}
                                        fill
                                        className="object-contain"
                                        sizes="100vw"
                                        priority
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* ── Caption Footer (contexte uniquement) ── */}
                        <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 flex flex-col gap-1 justify-end text-white/60 font-[family-name:var(--font-lora)] pointer-events-none z-[110]">
                            <p className="italic text-base drop-shadow-md max-w-[70vw]">
                                {photos[activeIndex].caption ?? photos[activeIndex].name?.replace(/[-_]/g, ' ')}
                            </p>
                            <p className="self-end font-sans not-italic text-xs tracking-widest uppercase drop-shadow-md text-white/40 mt-1">
                                {activeIndex + 1} / {photos.length}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

