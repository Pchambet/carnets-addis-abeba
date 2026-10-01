import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    children?: ReactNode;
}

/** En-tête commun des pages de rubrique (galerie, carte…), aligné sur la grille du site. */
export default function PageHeader({ title, children }: PageHeaderProps) {
    return (
        <section className="border-b border-[var(--border)] py-14 sm:py-20">
            <div className="site-container">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-light italic text-[var(--ink)] tracking-tight mb-6">
                    {title}
                </h1>
                {children && (
                    <div className="max-w-2xl text-lg text-[var(--ink-light)] font-[family-name:var(--font-lora)] leading-relaxed">
                        {children}
                    </div>
                )}
            </div>
        </section>
    );
}
