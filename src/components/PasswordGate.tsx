'use client';

import { useId, useState } from 'react';
import { ACCESS_KEY, HAS_GATE } from '@/lib/access';

const DEFAULT_CODE = '0000';

/** Simple filtre côté navigateur (choix assumé, voir docs/PLAN.md) : code = NEXT_PUBLIC_SITE_PASSWORD ou 0000 */
export default function PasswordGate({ children }: { children: React.ReactNode }) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const errorId = useId();

    if (!HAS_GATE) return <>{children}</>;

    function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        if (code.trim() === (process.env.NEXT_PUBLIC_SITE_PASSWORD ?? DEFAULT_CODE)) {
            sessionStorage.setItem(ACCESS_KEY, '1');
            document.documentElement.dataset.access = 'open';
            document.getElementById('main-content')?.focus();
        } else {
            setError('Ce code ne correspond pas. Vérifiez-le et réessayez.');
        }
    }

    return (
        <>
            <div className="access-gate min-h-screen flex flex-col items-center justify-center px-6 py-16">
                <div className="max-w-sm w-full text-center">
                    <h1 className="text-4xl font-[family-name:var(--font-cormorant)] font-light text-[var(--ink)] leading-tight mb-8">
                        La Parenthèse<br />
                        <em className="text-[var(--ochre)]">du dimanche soir</em>
                    </h1>
                    <p className="text-[var(--ink-light)] font-[family-name:var(--font-lora)] leading-relaxed mb-8">
                        Les lettres de Claire depuis <span className="whitespace-nowrap">Addis-Abéba</span> sont réservées à ses proches. Entrez le code pour les lire.
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
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? errorId : undefined}
                            className="w-full px-4 py-3.5 border border-[var(--ink-light)] bg-[var(--white)] text-[var(--ink)] placeholder:text-[var(--ink-light)] font-[family-name:var(--font-lora)] text-center text-xl tracking-[0.4em] rounded-sm focus:outline-none focus:ring-2 focus:ring-[var(--ochre)]"
                            maxLength={10}
                            autoFocus
                        />
                        {error && (
                            <p id={errorId} role="alert" className="text-sm text-[var(--red)] font-[family-name:var(--font-lora)]">
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
            </div>
            <div className="access-content">{children}</div>
        </>
    );
}
