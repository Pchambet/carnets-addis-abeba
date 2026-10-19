import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Comme sur Vercel : l'heure du serveur est en UTC
process.env.TZ = 'UTC';

const send = vi.fn().mockResolvedValue({ error: null });
vi.mock('resend', () => ({ Resend: class { emails = { send }; } }));

const { POST } = await import('@/app/api/comment-notify/route');

const record = {
    id: '1',
    letter_id: 'semaine-46',
    parent_id: null,
    author: 'Jeanne <b>',
    email: null,
    content: 'Merci\n<script>',
    is_claire: false,
    approved: true,
    created_at: '2026-10-19T08:30:00Z',
};

function call(body: unknown, authorization = 'Bearer s3cret') {
    return POST(new NextRequest('https://example.test/api/comment-notify/', {
        method: 'POST',
        headers: { authorization, 'content-type': 'application/json' },
        body: JSON.stringify(body),
    }));
}

beforeEach(() => {
    send.mockClear();
    process.env.COMMENT_WEBHOOK_SECRET = 's3cret';
    process.env.RESEND_API_KEY = 're_test';
    process.env.CLAIRE_EMAIL = 'claire@example.test';
});

describe('POST /api/comment-notify', () => {
    it.each(['', 'Bearer wrong', 'Bearer s3cret-but-longer'])('rejects the secret %j', async (authorization) => {
        expect((await call({ type: 'INSERT', table: 'comments', record }, authorization)).status).toBe(401);
        expect(send).not.toHaveBeenCalled();
    });

    it('rejects a payload that is not a new comment', async () => {
        expect((await call({ type: 'DELETE', table: 'comments', record })).status).toBe(400);
    });

    it('rejects a letter id that is not a letter', async () => {
        const res = await call({ type: 'INSERT', table: 'comments', record: { ...record, letter_id: '"><a href=x>' } });
        expect(res.status).toBe(400);
        expect(send).not.toHaveBeenCalled();
    });

    it('emails Claire an escaped message with the letter link, in Paris time', async () => {
        expect((await call({ type: 'INSERT', table: 'comments', record })).status).toBe(200);
        const { subject, html } = send.mock.calls[0][0];
        expect(subject).toContain('« Retour »');
        expect(html).toContain('https://carnets-addis-abeba.vercel.app/letters/semaine-46/');
        expect(html).toContain('Jeanne &lt;b&gt;');
        expect(html).toContain('Merci<br>&lt;script&gt;');
        expect(html).toContain('10:30');
    });
});
