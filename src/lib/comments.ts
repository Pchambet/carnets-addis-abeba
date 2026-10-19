import type { Comment } from '@/types/comment';

/** Ce que le navigateur peut écrire (droits par colonne : supabase/migrations/004) */
export type NewComment = Pick<Comment, 'letter_id' | 'parent_id' | 'author' | 'content'> & { email: string | null };

export interface CommentError {
    code?: string;
    message?: string;
}

/** Colonnes publiques : l'email des visiteurs n'est jamais lisible depuis le navigateur */
const PUBLIC_COLUMNS = 'id,letter_id,parent_id,author,content,is_claire,approved,created_at';

/** API REST de Supabase (PostgREST), avec la clé publique : deux appels suffisent au livre d'or */
function rest(query = '') {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
    return {
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/comments${query}`,
        headers: { apikey: key, Authorization: `Bearer ${key}` },
    };
}

/** Messages approuvés d'une lettre, du plus ancien au plus récent */
export async function fetchComments(letterId: string): Promise<Comment[]> {
    const params = new URLSearchParams({
        select: PUBLIC_COLUMNS,
        letter_id: `eq.${letterId}`,
        approved: 'eq.true',
        order: 'created_at.asc',
    });
    const { url, headers } = rest(`?${params}`);
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Livre d'or : lecture impossible (${res.status})`);
    return res.json();
}

/** Publie un message ; renvoie l'erreur (règles de la table, plafond, réseau) ou null */
export async function postComment(comment: NewComment): Promise<CommentError | null> {
    const { url, headers } = rest();
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
            body: JSON.stringify(comment),
        });
        if (res.ok) return null;
        return (await res.json().catch(() => ({ message: `HTTP ${res.status}` }))) as CommentError;
    } catch (error) {
        return { message: String(error) };
    }
}

/** Arbre des réponses. L'ordre d'entrée (created_at croissant, fixé par la requête) est conservé. */
export function buildCommentTree(comments: Comment[]): Comment[] {
    const byId = new Map(comments.map((c) => [c.id, { ...c, replies: [] as Comment[] }]));
    const roots: Comment[] = [];
    for (const node of byId.values()) {
        const parent = node.parent_id ? byId.get(node.parent_id) : undefined;
        // Parent masqué (non approuvé) : la réponse reste visible, au premier niveau
        (parent ? parent.replies : roots).push(node);
    }
    return roots;
}

/** Message affiché quand l'envoi échoue : jamais l'erreur brute (technique, en anglais). */
export function commentErrorMessage(error: CommentError): string {
    // Plafond posé par supabase/migrations/005_fix_replies_rate_limit.sql
    if (error.message?.includes('comments_rate_limited')) {
        return 'Beaucoup de messages ont été envoyés ces dernières minutes : réessayez un peu plus tard.';
    }
    // Règles de la table (longueurs, lettre, réponse) : 42501 = RLS, 23514 = contrainte
    if (error.code === '42501' || error.code === '23514') {
        return 'Message refusé : le pseudonyme est limité à 80 caractères et le message à 5000. Pour une réponse, le message d’origine a peut-être été retiré.';
    }
    return 'L’envoi a échoué. Vérifiez votre connexion et réessayez.';
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 365 * 24 * 3600],
    ['month', 30 * 24 * 3600],
    ['day', 24 * 3600],
    ['hour', 3600],
    ['minute', 60],
];
const relative = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

/** « il y a 3 jours », « hier », « l’année dernière » */
export function relativeTime(iso: string, now = new Date()): string {
    const seconds = (now.getTime() - new Date(iso).getTime()) / 1000;
    for (const [unit, size] of UNITS) {
        if (seconds >= size) return relative.format(-Math.floor(seconds / size), unit);
    }
    return 'à l’instant';
}
