import Image from 'next/image';

interface Photo {
    src: string;
    alt: string;
}

export default function PhotoGallery({ photos }: { photos: Photo[] }) {
    if (!photos || photos.length === 0) return null;

    // Different grid layouts based on number of photos
    const isSingle = photos.length === 1;
    const isPair = photos.length === 2;

    return (
        <section className="my-20">
            <p className="caption text-[var(--ochre)] text-center mb-8">Fragments du voyage</p>

            <div
                className={`
          grid gap-3
          ${isSingle ? 'grid-cols-1' : ''}
          ${isPair ? 'grid-cols-2' : ''}
          ${!isSingle && !isPair ? 'grid-cols-2 md:grid-cols-3' : ''}
        `}
            >
                {photos.map((photo, i) => (
                    <div
                        key={i}
                        className={`
              relative overflow-hidden bg-[var(--border)]
              ${isSingle ? 'aspect-[16/9] max-w-2xl mx-auto w-full' : ''}
              ${isPair ? 'aspect-square' : ''}
              ${!isSingle && !isPair && i === 0 ? 'col-span-2 aspect-[16/9]' : ''}
              ${!isSingle && !isPair && i !== 0 ? 'aspect-square' : ''}
            `}
                        style={{ filter: 'contrast(1.02) saturate(0.95)' }} /* Slight print-film look */
                    >
                        <Image
                            src={photo.src}
                            alt={photo.alt}
                            fill
                            className="object-cover transition-transform duration-700 ease-in-out hover:scale-[1.025]"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
