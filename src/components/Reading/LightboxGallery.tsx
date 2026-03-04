'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Photo {
    src: string;
    name: string;
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
    }, [activeIndex]);

    const handlePrev = () => {
        setActiveIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
    };

    return (
        <>
            {/* ── Photo Grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {photos.map((photo, i) => (
                    <div
                        key={i}
                        className="relative aspect-square overflow-hidden bg-[var(--border)] cursor-zoom-in group"
                        title={photo.name}
                        onClick={() => setActiveIndex(i)}
                    >
                        <Image
                            src={photo.src}
                            alt={photo.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                            sizes="(max-width: 768px) 50vw, 25vw"
                            style={{ filter: 'contrast(1.02) saturate(0.93)' }}
                        />
                        {/* Subtle dark overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                    </div>
                ))}
            </div>

            {/* ── Fullscreen Lightbox Overlay ── */}
            <AnimatePresence>
                {activeIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center overscroll-none"
                    >
                        {/* ── Close Button ── */}
                        <button
                            onClick={() => setActiveIndex(null)}
                            className="absolute top-6 right-6 z-[110] text-white/50 hover:text-white transition-colors p-4 cursor-pointer"
                            aria-label="Fermer"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* ── Next/Prev Areas ── */}
                        <button
                            className="absolute left-0 top-0 bottom-0 w-[20vw] z-[110] flex items-center justify-start pl-6 md:pl-12 group focus:outline-none cursor-w-resize"
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
                            className="absolute right-0 top-0 bottom-0 w-[20vw] z-[110] flex items-center justify-end pr-6 md:pr-12 group focus:outline-none cursor-e-resize"
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
                            className="relative w-full h-full max-w-[90vw] max-h-[85vh] flex items-center justify-center p-4"
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
                                        alt={photos[activeIndex].name}
                                        fill
                                        className="object-contain"
                                        sizes="100vw"
                                        priority
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* ── Caption Footer ── */}
                        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end text-white/50 font-[family-name:var(--font-lora)] italic pointer-events-none z-[110]">
                            <p className="max-w-[70vw] truncate drop-shadow-md text-lg">
                                {photos[activeIndex].name?.replace(/[-_]/g, ' ')}
                            </p>
                            <p className="font-sans not-italic text-sm tracking-widest uppercase drop-shadow-md text-white/40">
                                {activeIndex + 1} / {photos.length}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

