'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Comment } from '@/types/comment';
import CommentForm from './CommentForm';

interface CommentItemProps {
    comment: Comment;
    letterId: string;
    onReplySuccess?: () => void;
}

function getInitial(name: string): string {
    return (name.trim().charAt(0) || '?').toUpperCase();
}

export default function CommentItem({
    comment,
    letterId,
    onReplySuccess,
}: CommentItemProps) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const isClaire = comment.is_claire;
    const initial = getInitial(comment.author);
    const dateStr = formatDistanceToNow(new Date(comment.created_at), {
        addSuffix: true,
        locale: fr,
    });

    return (
        <div className="flex gap-4">
            <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-[family-name:var(--font-cormorant)] font-medium"
                style={{
                    backgroundColor: isClaire ? 'var(--ochre)' : 'var(--border)',
                    color: isClaire ? 'var(--white)' : 'var(--ink-light)',
                }}
            >
                {initial}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <span
                        className={`font-[family-name:var(--font-cormorant)] font-medium ${
                            isClaire ? 'text-[var(--ochre)]' : 'text-[var(--ink)]'
                        }`}
                    >
                        {comment.author}
                    </span>
                    {isClaire && (
                        <span className="caption text-[var(--ochre)]">Claire</span>
                    )}
                    <span className="caption text-[var(--ink-light)]">{dateStr}</span>
                </div>
                <p className="font-[family-name:var(--font-lora)] text-[var(--ink)] leading-relaxed mb-3">
                    {comment.content}
                </p>
                {!showReplyForm ? (
                    <button
                        type="button"
                        onClick={() => setShowReplyForm(true)}
                        className="caption text-[var(--ochre)] hover:underline"
                    >
                        Répondre
                    </button>
                ) : (
                    <div className="mt-2 pl-4 border-l-2 border-[var(--border)]">
                        <CommentForm
                            letterId={letterId}
                            parentId={comment.id}
                            isReply
                            onSuccess={() => {
                                setShowReplyForm(false);
                                onReplySuccess?.();
                            }}
                            onCancel={() => setShowReplyForm(false)}
                        />
                    </div>
                )}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4 pl-4 border-l-2 border-[var(--border)]">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                letterId={letterId}
                                onReplySuccess={onReplySuccess}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
