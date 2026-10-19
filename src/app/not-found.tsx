import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/Layout/PageHeader';

export const metadata: Metadata = { title: 'Page introuvable' };

export default function NotFound() {
    return (
        <PageHeader title="Page introuvable">
            <p>Cette page n’existe pas, ou plus.</p>
            <p className="mt-8">
                <Link href="/" className="caption text-[var(--ochre)]">← Retour aux lettres</Link>
            </p>
        </PageHeader>
    );
}
