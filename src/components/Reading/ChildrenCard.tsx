// ChildrenCard — a postcard-style component for letters / drawings from the children.
interface ChildrenCardProps {
    from?: string;
    imageSrc?: string;
    text?: string;
}

export default function ChildrenCard({ from, imageSrc, text }: ChildrenCardProps) {
    return (
        <section className="my-20 px-4">
            <p className="caption text-[var(--red)] text-center mb-8">Un mot des enfants</p>
            <div
                className="max-w-lg mx-auto bg-[var(--white)] border border-[var(--border)] p-8 md:p-12 relative"
                style={{
                    boxShadow: '6px 6px 0 #DDD5C8',
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #DDD5C8 31px, #DDD5C8 32px)',
                    backgroundPositionY: '40px',
                }}
            >
                {/* Stamp corner motif */}
                <div className="absolute top-4 right-4 w-12 h-16 border border-[var(--red)] opacity-30 flex items-center justify-center">
                    <span className="text-2xl">✉</span>
                </div>

                {imageSrc && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={imageSrc}
                        alt={`Dessin de ${from ?? 'un enfant'}`}
                        className="w-full max-h-64 object-contain mb-8"
                    />
                )}
                {text && (
                    <p className="text-[var(--ink)] font-[family-name:var(--font-lora)] italic leading-loose text-lg">
                        {text}
                    </p>
                )}
                {from && (
                    <p className="mt-6 caption text-[var(--ink-light)]">— {from}</p>
                )}
            </div>
        </section>
    );
}
