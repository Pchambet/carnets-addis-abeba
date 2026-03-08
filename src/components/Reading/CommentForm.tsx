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
            approved: true,
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
            <p className="livre-dor-success text-[var(--ochre)] italic font-[family-name:var(--font-lora)]">
                Merci ! Votre message est publié.
            </p>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
                <p className="text-sm text-[var(--red)] font-[family-name:var(--font-lora)]">{errorMsg}</p>
            )}
            <div className="grid sm:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="author" className="block caption text-[var(--ink-light)] mb-2">
                        Pseudonyme
                    </label>
                    <input
                        id="author"
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Votre nom ou pseudo"
                        className="livre-dor-form-input w-full px-4 py-3.5 border border-[var(--border)] bg-[var(--white)] text-[var(--ink)] font-[family-name:var(--font-lora)] rounded-sm focus:outline-none"
                        required
                        disabled={status === 'loading'}
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block caption text-[var(--ink-light)] mb-2">
                        Email <span className="opacity-70">(optionnel)</span>
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="pour les notifications"
                        className="livre-dor-form-input w-full px-4 py-3.5 border border-[var(--border)] bg-[var(--white)] text-[var(--ink)] font-[family-name:var(--font-lora)] rounded-sm focus:outline-none"
                        disabled={status === 'loading'}
                    />
                </div>
            </div>
            <div>
                <label htmlFor="content" className="block caption text-[var(--ink-light)] mb-2">
                    Commentaire
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={isReply ? 'Répondre…' : 'Écrivez votre message…'}
                    rows={isReply ? 2 : 4}
                    className="livre-dor-form-input w-full px-4 py-3.5 border border-[var(--border)] bg-[var(--white)] text-[var(--ink)] font-[family-name:var(--font-lora)] rounded-sm resize-y focus:outline-none leading-relaxed"
                    required
                    disabled={status === 'loading'}
                />
            </div>
            <div className="flex gap-3 pt-1">
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="livre-dor-btn px-8 py-3 bg-[var(--ochre)] text-[var(--white)] caption tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {status === 'loading' ? 'Envoi…' : isReply ? 'Répondre' : 'Publier'}
                </button>
                {isReply && onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 caption text-[var(--ink-light)] hover:text-[var(--ink)] transition-colors duration-200"
                    >
                        Annuler
                    </button>
                )}
            </div>
        </form>
    );
}
