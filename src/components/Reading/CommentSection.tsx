'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Comment } from '@/types/comment';
import { buildCommentTree, fetchComments } from '@/lib/comments';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommentSectionProps {
    letterId: string;
}

export default function CommentSection({ letterId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    const applyResult = useCallback((data: Comment[] | null, err: unknown) => {
        setFailed(Boolean(err));
        setComments(err ? [] : data ?? []);
        setLoading(false);
    }, []);

    const reload = useCallback(() => {
        fetchComments(letterId).then((data) => applyResult(data, null), (err) => applyResult(null, err));
    }, [letterId, applyResult]);

    useEffect(() => {
        let cancelled = false;
        fetchComments(letterId).then(
            (data) => !cancelled && applyResult(data, null),
            (err) => !cancelled && applyResult(null, err),
        );
        return () => {
            cancelled = true;
        };
    }, [letterId, applyResult]);

    const tree = buildCommentTree(comments);

    return (
        <section className="max-w-4xl mx-auto px-6 md:px-12 py-12 mt-16">
            <div className="livre-dor">
                <h2 className="livre-dor-title">
                    Correspondance
                </h2>

                <CommentForm letterId={letterId} onSuccess={reload} />

                <div className="livre-dor-divider" />

                <h3 className="caption text-[var(--ink-light)] mb-6">
                    {loading || failed ? 'Messages' : `${comments.length} message${comments.length > 1 ? 's' : ''}`}
                </h3>
                {loading ? (
                    <p className="caption text-[var(--ink-light)]">
                        Chargement…
                    </p>
                ) : failed ? (
                    <p role="alert" className="text-sm text-[var(--red)]">
                        Les messages n’ont pas pu être chargés. Réessayez plus tard.
                    </p>
                ) : tree.length === 0 ? (
                    <p className="caption text-[var(--ink-light)] italic">
                        Aucun message pour le moment. Soyez le premier à écrire&nbsp;!
                    </p>
                ) : (
                    <div className="space-y-6">
                        {tree.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                letterId={letterId}
                                onReplySuccess={reload}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
