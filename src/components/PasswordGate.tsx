'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'carnets_access';
const DEFAULT_CODE = '0000';

export default function PasswordGate({ children }: { children: React.ReactNode }) {
    const [unlocked, setUnlocked] = useState<boolean | null>(null);
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    // Pas de gate si NEXT_PUBLIC_SITE_UNLOCKED=1
    // Sinon, code = NEXT_PUBLIC_SITE_PASSWORD ou 0000 par défaut
    const forceUnlock = process.env.NEXT_PUBLIC_SITE_UNLOCKED === '1';
    const password = process.env.NEXT_PUBLIC_SITE_PASSWORD ?? DEFAULT_CODE;
    const hasGate = !forceUnlock;

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const value = !hasGate || sessionStorage.getItem(STORAGE_KEY) === '1';
        queueMicrotask(() => setUnlocked(value));
    }, [hasGate]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (code.trim() === password) {
            sessionStorage.setItem(STORAGE_KEY, '1');
            setUnlocked(true);
        } else {
            setError('Ce code ne correspond pas. Vérifiez-le et réessayez.');
        }
    }

    if (!hasGate) {
        return <>{children}</>;
    }

    if (unlocked === null) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="caption text-[var(--ink-light)]">Chargement…</p>
            </div>
        );
    }

    if (!unlocked) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
                <div className="max-w-sm w-full text-center">
                    <h1 className="text-4xl font-[family-name:var(--font-cormorant)] font-light text-[var(--ink)] leading-tight mb-8">
                        La Parenthèse<br />
                        <em className="text-[var(--ochre)]">du dimanche soir</em>
                    </h1>
                    <p className="text-[var(--ink-light)] font-[family-name:var(--font-lora)] leading-relaxed mb-8">
                        Les lettres de Claire depuis Addis-Abéba sont réservées à ses proches. Entrez le code pour les lire.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="password"
                            inputMode="numeric"
                            autoComplete="off"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                                setError('');
                            }}
                            placeholder="Code"
                            aria-label="Code d’accès"
                            className="w-full px-4 py-3.5 border border-[var(--border)] bg-[var(--white)] text-[var(--ink)] font-[family-name:var(--font-lora)] text-center text-xl tracking-[0.4em] rounded-sm focus:outline-none focus:ring-2 focus:ring-[var(--ochre)]"
                            maxLength={10}
                            autoFocus
                        />
                        {error && (
                            <p className="text-sm text-[var(--red)] font-[family-name:var(--font-lora)]">
                                {error}
                            </p>
                        )}
                        <button
                            type="submit"
                            className="livre-dor-btn w-full px-8 py-3.5 bg-[var(--ochre)] hover:bg-[#7A4522] text-[var(--white)] caption tracking-wider"
                        >
                            Lire les lettres
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return <>{children}</>;
}
