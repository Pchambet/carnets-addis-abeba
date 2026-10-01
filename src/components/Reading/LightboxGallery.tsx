"use client";

import { useState } from 'react';
import Image from 'next/image';
import { RowsPhotoAlbum, type RenderImageProps, type RenderImageContext } from 'react-photo-album';
import "react-photo-album/rows.css";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/plugins/captions.css";
import type { Photo } from '@/lib/photos';

declare module "yet-another-react-lightbox" {
    interface SlideImage {
        blurDataURL?: string;
    }
}

interface GalleryPhoto {
    src: string;
    width: number;
    height: number;
    alt: string;
    description?: string;
    blurDataURL?: string;
    thumbSrc?: string;
}

interface LightboxGalleryProps {
    photos: Photo[];
}

// react-photo-album wraps each image in a <button> carrying the click and keyboard handling.
function NextJsImage(
    { alt = "", title, sizes, className, style }: RenderImageProps,
    { photo, width, height }: RenderImageContext<GalleryPhoto>
) {
    return (
        <div
            style={{ width: "100%", position: "relative", aspectRatio: `${width} / ${height}` }}
            className="group cursor-zoom-in"
        >
            <Image
                fill
                src={photo.thumbSrc || photo.src}
                alt={alt}
                title={title}
                sizes={sizes}
                className={`object-cover ${className} transition-transform duration-700 group-hover:scale-[1.02]`}
                placeholder={photo.blurDataURL ? "blur" : "empty"}
                blurDataURL={photo.blurDataURL}
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
    const galleryPhotos: GalleryPhoto[] = photos.map((p) => ({
        src: p.src,
        width: p.width || 800,
        height: p.height || 600,
        alt: p.caption ? p.caption : "",
        // On supprime la propriété title pour que YARL n'affiche pas la barre grise en haut
        description: p.caption,
        blurDataURL: p.blurDataURL,
        thumbSrc: p.thumbSrc
    }));

    if (photos.length === 0) return null;

    return (
        <div className="my-8">
            <RowsPhotoAlbum
                photos={galleryPhotos}
                render={{
                    image: NextJsImage,
                    button: (props, { photo, index }) => (
                        <button {...props} aria-label={photo.alt ? `Agrandir : ${photo.alt}` : `Agrandir la photo ${index + 1}`} />
                    ),
                }}
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
                                    placeholder={slide.blurDataURL ? "blur" : "empty"}
                                    blurDataURL={slide.blurDataURL}
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
