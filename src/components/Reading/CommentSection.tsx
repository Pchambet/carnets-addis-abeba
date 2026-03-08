'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Comment } from '@/types/comment';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommentSectionProps {
    letterId: string;
}

function buildCommentTree(comments: Comment[]): Comment[] {
    const byId = new Map<string, Comment & { replies?: Comment[] }>();
    comments.forEach((c) => byId.set(c.id, { ...c, replies: [] }));

    const roots: Comment[] = [];
    comments.forEach((c) => {
        const node = byId.get(c.id)!;
        if (!c.parent_id) {
            roots.push(node);
        } else {
            const parent = byId.get(c.parent_id);
            if (parent) {
                parent.replies = parent.replies || [];
                parent.replies.push(node);
            } else {
                roots.push(node);
            }
        }
    });

    roots.sort(
        (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    (roots as (Comment & { replies?: Comment[] })[]).forEach((r) => {
        if (r.replies?.length) {
            r.replies.sort(
                (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime()
            );
        }
    });
    return roots;
}

export default function CommentSection({ letterId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchComments = useCallback(async () => {
        const { data, error: err } = await supabase
            .from('comments')
            .select('*')
            .eq('letter_id', letterId)
            .eq('approved', true)
            .order('created_at', { ascending: true });

        if (err) {
            setError(err.message);
            setComments([]);
        } else {
            setComments((data as Comment[]) || []);
        }
        setLoading(false);
    }, [letterId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const tree = buildCommentTree(comments);

    return (
        <section className="max-w-4xl mx-auto px-6 md:px-12 py-12 mt-16">
            <h2 className="text-xl font-[family-name:var(--font-cormorant)] font-light text-[var(--ink)] mb-6">
                Livre d&apos;or
            </h2>

            <CommentForm letterId={letterId} onSuccess={fetchComments} />

            <div className="mt-12 pt-8 border-t border-[var(--border)]">
                <h3 className="caption text-[var(--ink-light)] mb-6">
                    {comments.length} message{comments.length !== 1 ? 's' : ''}
                </h3>
                {loading ? (
                    <p className="caption text-[var(--ink-light)] opacity-70">
                        Chargement…
                    </p>
                ) : error ? (
                    <p className="text-sm text-[var(--red)]">{error}</p>
                ) : tree.length === 0 ? (
                    <p className="caption text-[var(--ink-light)] italic">
                        Aucun message pour le moment. Soyez le premier à écrire !
                    </p>
                ) : (
                    <div className="space-y-6">
                        {tree.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                letterId={letterId}
                                onReplySuccess={fetchComments}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
