import type { PhrasingContent } from 'mdast';
import { remark } from 'remark';
import { parseDayHeader } from '../src/lib/remarkDayHeaders';

// Données du livre papier (book/book.typ) : texte des lettres en blocs, grilles de photos, cadrages.
// Toutes les mesures sont en millimètres.

export type Inline = { t: 'text'; v: string } | { t: 'em' | 'strong'; c: Inline[] };

export type Block =
    | { t: 'p'; c: Inline[] }
    | { t: 'day'; name: string; date?: string; desc?: string }
    | { t: 'break' }
    | { t: 'sign'; v: string };

/**
 * Typographie d'imprimerie : espaces doublés réduits, apostrophes et guillemets simples typographiques,
 * apostrophe collée au mot élidé,
 * points de suspension, espace fine insécable avant ; ! ? » et après «, insécable avant :, tiret de
 * dialogue. Seuls les espaces et les signes changent, jamais les mots (le site ne touche qu'aux
 * espaces existants).
 */
export function bookTypography(text: string): string {
    return text
        .replace(/ {2,}/g, ' ')
        .replace(/(^|[\s(«])'(?=\p{L})/gu, '$1‘')
        .replace(/'/g, '’')
        .replace(/(?<=(?:^|\P{L})(?:[cdjlmnst]|qu|jusqu|lorsqu|puisqu|quoiqu|presqu)’) +(?=\p{L})/giu, '')
        .replace(/\.\.\./g, '…')
        .replace(/[ \u00a0\u202f]+(?=[;!?»])/g, '\u202f')
        .replace(/(?<=[\p{L}\p{N}…»)])(?=[;!?])/gu, '\u202f')
        .replace(/(?<=[^\s\u00a0\u202f«])(?=»)/g, '\u202f')
        .replace(/«[ \u00a0\u202f]*/g, '«\u202f')
        .replace(/[ \u00a0\u202f]+:/g, '\u00a0:')
        .replace(/(?<=\p{L})(?=:(\s|$))/gu, '\u00a0')
        .replace(/(^|\s)- /g, '$1– ');
}

/** Typographie d'un morceau de texte qui en suit un autre : « *magnifique*! » → espace fine avant « ! » */
function typesetAfter(before: string, text: string): string {
    const head = bookTypography(before);
    const all = bookTypography(before + text);
    return all.startsWith(head) ? all.slice(head.length) : bookTypography(text);
}

/** `seen` : fin du texte déjà lu dans le paragraphe, à travers italiques et gras */
function inlines(nodes: PhrasingContent[], seen = { text: '' }): Inline[] {
    return nodes.map((node): Inline => {
        switch (node.type) {
            case 'text': {
                const v = typesetAfter(seen.text, node.value);
                seen.text = (seen.text + node.value).slice(-12);
                return { t: 'text', v };
            }
            case 'emphasis': return { t: 'em', c: inlines(node.children, seen) };
            case 'strong': return { t: 'strong', c: inlines(node.children, seen) };
            default: throw new Error(`Markdown non imprimable : ${node.type}`);
        }
    });
}

const plain = (c: Inline[]): string => c.map((i) => (i.t === 'text' ? i.v : plain(i.c))).join('');

/** Corps d'une lettre (sans frontmatter ni « > PQ: ») → blocs à composer */
export function toBlocks(markdown: string): Block[] {
    const blocks = remark().parse(markdown).children.map((node): Block => {
        if (node.type === 'thematicBreak') return { t: 'break' };
        if (node.type !== 'paragraph') throw new Error(`Markdown non imprimable : ${node.type}`);

        const [only] = node.children;
        if (node.children.length === 1 && only.type === 'strong' && only.children.length === 1 && only.children[0].type === 'text') {
            const day = parseDayHeader(only.children[0].value);
            if (day) {
                const { name, date, desc } = day;
                return {
                    t: 'day',
                    name,
                    ...(date && { date: bookTypography(date) }),
                    ...(desc && { desc: bookTypography(desc) }),
                };
            }
        }
        return { t: 'p', c: inlines(node.children) };
    });

    const last = blocks.at(-1);
    if (last?.t === 'p' && plain(last.c).trim() === 'Claire') blocks[blocks.length - 1] = { t: 'sign', v: 'Claire' };
    return blocks;
}

const DATE = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** « 2025-11-01 » → « 1er novembre 2025 » */
export function dateLabel(date: string): string {
    return DATE.format(new Date(`${date}T00:00:00Z`)).replace(/^1 /, '1er ');
}

export interface PrintPhoto {
    src: string;
    width: number;
    height: number;
    caption?: string;
    format?: 'jpg' | 'png' | 'webp';
}

export interface Row {
    h: number;
    items: (Omit<PrintPhoto, 'width' | 'height'> & { w: number })[];
}

interface RowOptions {
    /** Largeur de la grille */
    width: number;
    gap: number;
    /** Hauteur de rangée visée : les rangées pleines s'en approchent, la dernière ne la dépasse pas */
    target: number;
    maxPerRow: number;
    maxHeight?: number;
}

/**
 * Grille « justifiée » : rangées de photos entières (aucun recadrage) qui remplissent la largeur.
 * Chaque rangée garde le nombre de photos dont la hauteur est la plus proche de la cible.
 */
export function layoutRows(photos: PrintPhoto[], { width, gap, target, maxPerRow, maxHeight = Infinity }: RowOptions): Row[] {
    const ratio = (p: PrintPhoto) => p.width / p.height;
    const fit = (row: PrintPhoto[]) => (width - gap * (row.length - 1)) / row.reduce((s, p) => s + ratio(p), 0);
    const toRow = (row: PrintPhoto[], h: number): Row => ({
        h,
        items: row.map(({ width, height, ...photo }) => ({ ...photo, w: (h * width) / height })),
    });

    const rows: Row[] = [];
    let row: PrintPhoto[] = [];
    for (const photo of photos) {
        const next = [...row, photo];
        if (row.length && Math.abs(fit(row) - target) < Math.abs(fit(next) - target) && fit(row) <= target * 1.3) {
            rows.push(toRow(row, Math.min(fit(row), maxHeight)));
            row = [photo];
        } else if (next.length === maxPerRow || fit(next) <= target) {
            rows.push(toRow(next, Math.min(fit(next), maxHeight)));
            row = [];
        } else {
            row = next;
        }
    }
    // Dernière rangée incomplète : à la hauteur visée, sans étirer
    if (row.length) rows.push(toRow(row, Math.min(fit(row), target, maxHeight)));
    return rows;
}

/** Place des légendes : hauteur de la première ligne, des suivantes, largeur moyenne d'un caractère */
export interface CaptionRoom {
    first: number;
    line: number;
    charWidth: number;
}

/** Hauteur réservée sous une rangée : sa légende la plus longue, sur autant de lignes que sa largeur l'impose */
const captionHeight = (row: Row, { first, line, charWidth }: CaptionRoom) =>
    Math.max(0, ...row.items.filter((it) => it.caption).map((it) =>
        first + (Math.ceil((it.caption!.length * charWidth) / it.w) - 1) * line));

/**
 * Répartit les rangées sur des pages de hauteur donnée, dans l'ordre, légendes comprises. Plutôt
 * que de laisser une rangée seule sur la page suivante, une page peut réduire toutes ses photos,
 * jusqu'à `shrink` (88 % par défaut).
 */
export function paginate(
    rows: Row[],
    { height, gap, caption, shrink = 0.88 }: { height: number; gap: number; caption: CaptionRoom; shrink?: number }
): Row[][] {
    const scale = (page: Row[]) => {
        const captions = page.reduce((s, r) => s + captionHeight(r, caption), 0);
        return (height - captions - gap * (page.length - 1)) / page.reduce((s, r) => s + r.h, 0);
    };
    const pages: Row[][] = [];
    for (const row of rows) {
        const page = pages.at(-1);
        if (page && scale([...page, row]) >= shrink) page.push(row);
        else pages.push([row]);
    }
    return pages.map((page) => {
        const s = Math.min(1, scale(page));
        return s === 1 ? page : page.map((r) => ({ h: r.h * s, items: r.items.map((it) => ({ ...it, w: it.w * s })) }));
    });
}

/**
 * Photos d'une lettre : celle d'ouverture (`hero`, sinon la première) et la grille, sans doublon.
 * `chosen` (book/photos.json) : noms des fichiers retenus, dans l'ordre voulu.
 */
export function choosePhotos<P extends { src: string }>(
    photos: P[],
    { hero, chosen }: { hero?: string; chosen?: string[] }
): { hero?: P; grid: P[] } {
    const nfc = (s: string) => s.normalize('NFC');
    const find = (name: string, match: (p: P) => boolean) => {
        const photo = photos.find(match);
        if (!photo) throw new Error(`photo introuvable : ${name}`);
        return photo;
    };
    const pool = chosen ? chosen.map((name) => find(name, (p) => nfc(p.src.split('/').at(-1)!) === nfc(name))) : photos;
    const opening = hero ? find(hero, (p) => nfc(p.src) === nfc(hero)) : pool[0];
    return { hero: opening, grid: pool.filter((p) => p !== opening) };
}

/** Position verticale d'un `object-position` CSS (« bottom », « center 30% ») : 0 en haut, 1 en bas */
function verticalPosition(position = 'center'): number {
    const y = position.trim().split(/\s+/).at(-1)!;
    if (y.endsWith('%')) return parseFloat(y) / 100;
    return { top: 0, bottom: 1 }[y] ?? 0.5;
}

/**
 * Cadrage d'une photo pleine largeur (ouverture de lettre) : comme `object-fit: cover`, avec la
 * même position verticale que sur le site. w, h : taille affichée ; dx, dy : décalage dans le cadre.
 */
export function heroFrame(
    image: { width: number; height: number },
    box: { width: number; height: number },
    position?: string
): { w: number; h: number; dx: number; dy: number } {
    if (image.width / image.height >= box.width / box.height) {
        const w = (box.height * image.width) / image.height;
        return { w, h: box.height, dx: -(w - box.width) / 2, dy: 0 };
    }
    const h = (box.width * image.height) / image.width;
    return { w: box.width, h, dx: 0, dy: -(h - box.height) * verticalPosition(position) };
}
