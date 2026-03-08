'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface CommentFormProps {
    letterId: string;
    parentId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    isReply?: boolean;
}

export default function CommentForm({
    letterId,
    parentId,
    onSuccess,
    onCancel,
    isReply = false,
}: CommentFormProps) {
    const [author, setAuthor] = useState('');
    const [email, setEmail] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!author.trim() || !content.trim()) {
            setErrorMsg('Pseudonyme et commentaire requis.');
            return;
        }
        setStatus('loading');
        setErrorMsg('');

        const { error } = await supabase.from('comments').insert({
            letter_id: letterId,
            parent_id: parentId || null,
            author: author.trim(),
            email: email.trim() || null,
            content: content.trim(),
            is_claire: false,
            approved: false,
        });

        if (error) {
            setStatus('error');
            setErrorMsg(error.message || 'Erreur lors de l\'envoi.');
            return;
        }

        setStatus('success');
        setAuthor('');
        setEmail('');
        setContent('');
        onSuccess?.();
    }

    if (status === 'success') {
        return (
            <p className="text-sm text-[var(--ochre)] italic">
                Merci ! Votre message sera visible après modération.
            </p>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
                <p className="text-sm text-[var(--red)]">{errorMsg}</p>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="author" className="block caption text-[var(--ink-light)] mb-1">
                        Pseudonyme
                    </label>
                    <input
                        id="author"
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Votre nom ou pseudo"
                        className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--white)] text-[var(--ink)] font-[family-name:var(--font-lora)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--ochre)]"
                        required
                        disabled={status === 'loading'}
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block caption text-[var(--ink-light)] mb-1">
                        Email <span className="opacity-70">(optionnel)</span>
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="pour les notifications"
                        className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--white)] text-[var(--ink)] font-[family-name:var(--font-lora)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--ochre)]"
                        disabled={status === 'loading'}
                    />
                </div>
            </div>
            <div>
                <label htmlFor="content" className="block caption text-[var(--ink-light)] mb-1">
                    Commentaire
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={isReply ? 'Répondre…' : 'Écrivez votre message…'}
                    rows={isReply ? 2 : 4}
                    className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--white)] text-[var(--ink)] font-[family-name:var(--font-lora)] rounded resize-y focus:outline-none focus:ring-1 focus:ring-[var(--ochre)]"
                    required
                    disabled={status === 'loading'}
                />
            </div>
            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-6 py-2.5 bg-[var(--ochre)] text-[var(--white)] caption hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {status === 'loading' ? 'Envoi…' : isReply ? 'Répondre' : 'Publier'}
                </button>
                {isReply && onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 caption text-[var(--ink-light)] hover:text-[var(--ink)] transition-colors"
                    >
                        Annuler
                    </button>
                )}
            </div>
        </form>
    );
}
