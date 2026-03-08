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
        <div className="livre-dor-comment flex gap-5 py-4 first:pt-0">
            <div
                className={`livre-dor-avatar flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-sm font-[family-name:var(--font-cormorant)] font-medium ${
                    isClaire ? 'bg-[var(--ochre)] text-[var(--white)]' : 'bg-[var(--border)] text-[var(--ink-light)]'
                }`}
            >
                {initial}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2 mb-1.5">
                    <span
                        className={`font-[family-name:var(--font-cormorant)] text-lg font-medium ${
                            isClaire ? 'text-[var(--ochre)]' : 'text-[var(--ink)]'
                        }`}
                    >
                        {comment.author}
                    </span>
                    {isClaire && (
                        <span className="text-xs text-[var(--gold)] font-medium tracking-wider">Claire</span>
                    )}
                    <span className="caption text-[var(--ink-light)] opacity-90">{dateStr}</span>
                </div>
                <p className="font-[family-name:var(--font-lora)] text-[var(--ink)] leading-[1.75] mb-4">
                    {comment.content}
                </p>
                {!showReplyForm ? (
                    <button
                        type="button"
                        onClick={() => setShowReplyForm(true)}
                        className="livre-dor-reply-btn caption text-[var(--ink-light)]"
                    >
                        Répondre
                    </button>
                ) : (
                    <div className="mt-3 pl-5 livre-dor-reply-border">
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
                    <div className="mt-5 space-y-5 pl-5 livre-dor-reply-border">
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
