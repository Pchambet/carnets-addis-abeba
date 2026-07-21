"use client";

import { useState } from 'react';
import Image from 'next/image';
import { RowsPhotoAlbum, RenderPhotoProps } from 'react-photo-album';
import "react-photo-album/rows.css";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/plugins/captions.css";

export interface Photo {
    src: string;
    name: string;
    caption?: string;
    blurDataURL?: string;
    width?: number;
    height?: number;
}

interface LightboxGalleryProps {
    photos: Photo[];
}

import { RenderImageProps, RenderImageContext } from 'react-photo-album';

function NextJsImage(
    { alt = "", title, sizes, className, onClick, style, ...rest }: RenderImageProps,
    { photo, width, height }: RenderImageContext
) {
    return (
        <div 
            style={{ width: "100%", position: "relative", aspectRatio: `${width} / ${height}` }} 
            className="group cursor-zoom-in"
            onClick={onClick}
        >
            <Image
                fill
                src={photo.src}
                alt={alt}
                title={title}
                sizes={sizes}
                className={`object-cover ${className} transition-transform duration-700 group-hover:scale-[1.02]`}
                placeholder={(photo as any).blurDataURL ? "blur" : "empty"}
                blurDataURL={(photo as any).blurDataURL}
                style={{ ...style, filter: 'contrast(1.02) saturate(0.93)' }}
            />
            {/* Subtle overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 pointer-events-none" aria-hidden />
        </div>
    );
}

export default function LightboxGallery({ photos }: LightboxGalleryProps) {
    const [index, setIndex] = useState(-1);

    // Format photos for react-photo-album and YARL
    const galleryPhotos = photos.map((p) => ({
        src: p.src,
        width: p.width || 800,
        height: p.height || 600,
        alt: p.caption ?? p.name,
        // On supprime la propriété title pour que YARL n'affiche pas la barre grise en haut
        description: p.caption,
        blurDataURL: p.blurDataURL
    }));

    if (photos.length === 0) return null;

    return (
        <div className="my-8">
            <RowsPhotoAlbum
                photos={galleryPhotos}
                render={{ image: NextJsImage }}
                targetRowHeight={300}
                spacing={12}
                onClick={({ index }) => setIndex(index)}
            />

            <Lightbox
                slides={galleryPhotos}
                open={index >= 0}
                index={index}
                close={() => setIndex(-1)}
                // On a retiré le plugin Thumbnails
                plugins={[Fullscreen, Slideshow, Zoom, Captions]}
                animation={{ fade: 300, swipe: 250 }}
                carousel={{ finite: false }}
                render={{
                    slide: ({ slide, rect }) => {
                        return (
                            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                                <Image
                                    fill
                                    alt={slide.alt || ""}
                                    src={slide.src}
                                    sizes={`${Math.ceil((rect.width / window.innerWidth) * 100)}vw`}
                                    placeholder={(slide as any).blurDataURL ? "blur" : "empty"}
                                    blurDataURL={(slide as any).blurDataURL}
                                    style={{ objectFit: "contain" }}
                                />
                            </div>
                        );
                    }
                }}
            />
        </div>
    );
}
