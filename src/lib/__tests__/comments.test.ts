import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildCommentTree, commentErrorMessage, fetchComments, postComment, relativeTime } from '../comments';
import type { Comment } from '@/types/comment';

const comment = (id: string, parent_id: string | null = null): Comment => ({
    id,
    letter_id: 'semaine-46',
    parent_id,
    author: id,
    content: id,
    is_claire: false,
    approved: true,
    created_at: '2026-10-19T10:00:00Z',
});

describe('buildCommentTree', () => {
    it('nests replies under their parent, keeping the query order', () => {
        const tree = buildCommentTree([comment('a'), comment('b'), comment('r1', 'a'), comment('r2', 'r1')]);
        expect(tree.map((c) => c.id)).toEqual(['a', 'b']);
        expect(tree[0].replies?.map((c) => c.id)).toEqual(['r1']);
        expect(tree[0].replies?.[0].replies?.map((c) => c.id)).toEqual(['r2']);
    });

    it('shows a reply whose parent is hidden as a top-level message', () => {
        expect(buildCommentTree([comment('r', 'hidden')]).map((c) => c.id)).toEqual(['r']);
    });
});

describe('commentErrorMessage', () => {
    it('explains the hourly limit', () => {
        expect(commentErrorMessage({ code: 'P0001', message: 'comments_rate_limited' })).toMatch(/plus tard/);
    });

    it('explains a message refused by the database rules', () => {
        expect(commentErrorMessage({ code: '42501', message: 'new row violates row-level security policy' }))
            .toMatch(/refusé/);
    });

    it('falls back to a network message, never the raw English error', () => {
        const message = commentErrorMessage({ code: '', message: 'TypeError: Failed to fetch' });
        expect(message).toMatch(/connexion/);
        expect(message).not.toMatch(/fetch/);
    });
});

describe('relativeTime', () => {
    const now = new Date('2026-10-19T12:00:00Z');

    it.each([
        ['2026-10-19T11:59:40Z', 'à l’instant'],
        ['2026-10-19T11:55:00Z', 'il y a 5 minutes'],
        ['2026-10-19T09:00:00Z', 'il y a 3 heures'],
        ['2026-10-18T12:00:00Z', 'hier'],
        ['2026-10-09T12:00:00Z', 'il y a 10 jours'],
        ['2026-07-19T12:00:00Z', 'il y a 3 mois'],
        ['2025-10-19T12:00:00Z', 'l’année dernière'],
        ['2023-10-19T12:00:00Z', 'il y a 3 ans'],
    ])('%s → %s', (iso, expected) => {
        expect(relativeTime(iso, now).replace(/ | /g, ' ')).toBe(expected);
    });
});

describe('Supabase REST calls', () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://db.example.test';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_test';
        vi.stubGlobal('fetch', fetchMock);
    });
    afterEach(() => {
        fetchMock.mockReset();
        vi.unstubAllGlobals();
    });

    it('reads the approved comments of a letter, without the email column', async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify([comment('a')]), { status: 200 }));
        expect(await fetchComments('semaine-46')).toEqual([comment('a')]);
        const [url, init] = fetchMock.mock.calls[0];
        const { pathname, searchParams } = new URL(url);
        expect(pathname).toBe('/rest/v1/comments');
        expect(searchParams.get('select')).toBe('id,letter_id,parent_id,author,content,is_claire,approved,created_at');
        expect(searchParams.get('letter_id')).toBe('eq.semaine-46');
        expect(searchParams.get('approved')).toBe('eq.true');
        expect(searchParams.get('order')).toBe('created_at.asc');
        expect(init.headers).toMatchObject({ apikey: 'sb_publishable_test', Authorization: 'Bearer sb_publishable_test' });
    });

    it('fails loudly when reading fails', async () => {
        fetchMock.mockResolvedValue(new Response('{}', { status: 503 }));
        await expect(fetchComments('semaine-46')).rejects.toThrow('503');
    });

    it('posts a comment and returns no error when it is stored', async () => {
        fetchMock.mockResolvedValue(new Response(null, { status: 201 }));
        const row = { letter_id: 'semaine-46', parent_id: null, author: 'Jeanne', email: null, content: 'Merci' };
        expect(await postComment(row)).toBeNull();
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('https://db.example.test/rest/v1/comments');
        expect(init.method).toBe('POST');
        expect(JSON.parse(init.body)).toEqual(row);
        expect(init.headers).toMatchObject({ 'Content-Type': 'application/json', Prefer: 'return=minimal' });
    });

    it('returns the database error, for commentErrorMessage', async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({ code: 'P0001', message: 'comments_rate_limited' }), { status: 400 }));
        expect(await postComment({ letter_id: 'semaine-46', parent_id: null, author: 'a', email: null, content: 'b' }))
            .toEqual({ code: 'P0001', message: 'comments_rate_limited' });
    });

    it('turns a network failure into an error, not an exception', async () => {
        fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
        const error = await postComment({ letter_id: 'semaine-46', parent_id: null, author: 'a', email: null, content: 'b' });
        expect(error?.message).toContain('Failed to fetch');
    });
});
