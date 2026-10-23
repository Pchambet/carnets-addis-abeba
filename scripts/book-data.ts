import type { PhrasingContent } from 'mdast';
import { remark } from 'remark';
import { parseDayHeader } from '../src/lib/remarkDayHeaders';

// Données du livre papier (book/book.typ) : texte des lettres en blocs, choix et placement des photos.
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

interface Size {
    width: number;
    height: number;
}

/** Position CSS `object-position` (« bottom », « center 20% », « 30% 60% ») → x, y entre 0 et 1 */
function objectPosition(position = 'center'): { x: number; y: number } {
    const keywords: Record<string, number> = { left: 0, top: 0, center: 0.5, right: 1, bottom: 1 };
    const value = (p: string) => (p.endsWith('%') ? parseFloat(p) / 100 : Object.hasOwn(keywords, p) ? keywords[p] : undefined);
    const parts = position.trim().split(/\s+/);
    // « bottom » seul, ou « top left » : les mots-clés verticaux donnent y, quel que soit leur rang
    const vertical = (p: string) => p === 'top' || p === 'bottom';
    const [px, py = 'center'] = parts.length === 1 && vertical(parts[0]) ? ['center', parts[0]]
        : vertical(parts[0]) || parts[1] === 'left' || parts[1] === 'right' ? [parts[1], parts[0]] : parts;
    const x = value(px);
    const y = value(py);
    if (parts.length > 2 || x === undefined || y === undefined || Number.isNaN(x) || Number.isNaN(y)) {
        throw new Error(`cadrage illisible : « ${position} »`);
    }
    return { x, y };
}

/**
 * Photo recadrée pour remplir un cadre (page à fond perdu), comme `object-fit: cover` avec
 * `object-position`. w, h : taille de l'image ; dx, dy : décalage dans le cadre.
 */
export function cover(image: Size, box: Size, position?: string): { w: number; h: number; dx: number; dy: number } {
    const scale = Math.max(box.width / image.width, box.height / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    const { x, y } = objectPosition(position);
    return { w, h, dx: (box.width - w) * x, dy: (box.height - h) * y };
}

/** Place des légendes : hauteur de la première ligne (écart compris), des suivantes, largeur moyenne d'un caractère */
export interface CaptionRoom {
    first: number;
    line: number;
    charWidth: number;
}

/** Photo posée dans un groupe : image en (x, y), de taille w × h ; légende dessous */
export interface Cell {
    src: string;
    format?: PrintPhoto['format'];
    caption?: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

// Arrangement en rangées et colonnes, sans recadrage. Chaque nœud a une hauteur affine en sa
// largeur, h = a·w + b : a vient des proportions des photos, b des écarts et des légendes.
type Tree = number | { row: Tree[] } | { col: Tree[] };

const ARRANGEMENTS: Record<number, Tree[]> = {
    1: [0],
    2: [{ row: [0, 1] }, { col: [0, 1] }],
    // La première photo d'un trio est la principale : seule, à gauche ou en haut, quand les deux autres se partagent la place
    3: [{ row: [0, 1, 2] }, { col: [0, 1, 2] }, { row: [0, { col: [1, 2] }] }, { col: [0, { row: [1, 2] }] }],
};

/**
 * Groupe de 1 à 3 photos entières, aussi grand que le cadre le permet : l'arrangement retenu est
 * celui qui imprime les photos le plus grand (pour un trio, la première restant la plus grande).
 * Coordonnées depuis le coin du groupe.
 */
export function arrange(photos: PrintPhoto[], box: Size, { gap, caption }: { gap: number; caption: CaptionRoom }): Size & { cells: Cell[] } {
    const ratio = (i: number) => photos[i].width / photos[i].height;
    // Entre deux colonnes, la gouttière égale celle qui, entre deux rangées, porte une légende
    const across = photos.some((p) => p.caption) ? gap + caption.first : gap;
    // Hauteur de légende sous une image de largeur w
    const band = (i: number, w: number) => {
        const text = photos[i].caption;
        return text ? caption.first + (Math.max(1, Math.ceil((text.length * caption.charWidth) / w)) - 1) * caption.line : 0;
    };

    const layout = (tree: Tree) => {
        // Légendes estimées sur une ligne, puis recalculées à la largeur obtenue, jusqu'à stabilité
        let bands = photos.map((_, i) => band(i, Infinity));
        for (let attempt = 0; ; attempt++) {
            const group = place(tree, bands);
            const next = group.cells.map((c, i) => band(i, c.w));
            if (next.every((b, i) => b <= bands[i]) || attempt === 4) return group;
            bands = bands.map((b, i) => Math.max(b, next[i]));
        }
    };

    const place = (tree: Tree, bands: number[]) => {
        // Dans une rangée, les images restent alignées : chaque photo réserve la plus haute légende de la rangée
        const rowBand = new Map<number, number>();
        const visit = (t: Tree) => {
            if (typeof t === 'number') return;
            const kids = 'row' in t ? t.row : t.col;
            if ('row' in t) {
                const leaves = kids.filter((k): k is number => typeof k === 'number');
                for (const k of leaves) rowBand.set(k, Math.max(...leaves.map((l) => bands[l])));
            }
            kids.forEach(visit);
        };
        visit(tree);
        const own = (i: number) => rowBand.get(i) ?? bands[i];

        const model = (t: Tree): { a: number; b: number } => {
            if (typeof t === 'number') return { a: 1 / ratio(t), b: own(t) };
            const kids = ('row' in t ? t.row : t.col).map(model);
            const gaps = ('row' in t ? across : gap) * (kids.length - 1);
            if ('col' in t) return { a: kids.reduce((s, k) => s + k.a, 0), b: kids.reduce((s, k) => s + k.b, 0) + gaps };
            const sum = kids.reduce((s, k) => s + 1 / k.a, 0);
            return { a: 1 / sum, b: (kids.reduce((s, k) => s + k.b / k.a, 0) - gaps) / sum };
        };

        const cells: Cell[] = [];
        const put = (t: Tree, x: number, y: number, w: number) => {
            if (typeof t === 'number') {
                const { src, format, caption: text } = photos[t];
                cells[t] = { src, ...(format && { format }), ...(text && { caption: text }), x, y, w, h: w / ratio(t) };
                return;
            }
            const { a, b } = model(t);
            const h = a * w + b;
            for (const kid of 'row' in t ? t.row : t.col) {
                const m = model(kid);
                if ('row' in t) {
                    const kw = (h - m.b) / m.a;
                    put(kid, x, y, kw);
                    x += kw + across;
                } else {
                    put(kid, x, y, w);
                    y += m.a * w + m.b + gap;
                }
            }
        };

        const { a, b } = model(tree);
        const width = Math.min(box.width, (box.height - b) / a);
        put(tree, 0, 0, width);
        return { width, height: a * width + b, cells };
    };

    const options = (ARRANGEMENTS[photos.length] ?? []).map(layout).filter((g) => g.width > 0);
    if (!options.length) throw new Error(`${photos.length} photo(s) : arrangement impossible`);
    const area = (c: Cell) => c.w * c.h;
    const leading = options.filter((g) => photos.length < 3 || g.cells.every((c) => area(g.cells[0]) >= area(c) - 1e-9));
    return (leading.length ? leading : options).reduce((best, g) =>
        g.cells.reduce((s, c) => s + area(c), 0) > best.cells.reduce((s, c) => s + area(c), 0) ? g : best);
}

/** Page de photos dans book/layout.json : noms de fichiers, dans l'ordre de lecture */
export interface PageLayout {
    layout: 'full' | 'single' | 'pair' | 'trio';
    photos: string[];
    /** single : « large » (par défaut) ou « small », plus de blanc autour */
    size?: 'large' | 'small';
    /** full : cadrage, position CSS */
    focus?: string;
}

/** Choix d'une lettre dans book/layout.json : photo d'ouverture et son cadrage, pages, page de réserve */
export interface LetterLayout {
    hero?: string;
    focus?: string;
    pages?: PageLayout[];
    /** Photo seule, imprimée seulement si la lettre doit finir sur une page de droite */
    spare?: string;
    /** Fin de lettre seule en haut d'une page : texte un rien plus serré (« tight ») ou plus lâche (« loose ») */
    fit?: 'tight' | 'loose';
}

const PER_PAGE: Record<PageLayout['layout'], number> = { full: 1, single: 1, pair: 2, trio: 3 };

/**
 * Photos d'une lettre à imprimer : celles du plan (book/layout.json), vérifié ; sans plan, toutes,
 * deux par page quand leurs orientations s'accordent. L'ouverture est celle du plan, sinon celle
 * du site (`heroImage`), sinon la première photo.
 */
export function editPhotos<P extends { src: string; width: number; height: number }>(
    photos: P[],
    plan: LetterLayout | undefined,
    site: { hero?: string; focus?: string }
): { hero?: { photo: P; focus?: string }; pages: (Omit<PageLayout, 'photos'> & { photos: P[] })[]; spare?: P } {
    const nfc = (s: string) => s.normalize('NFC');
    const used = new Set<P>();
    const take = (name: string, match: (p: P) => boolean) => {
        const photo = photos.find(match);
        if (!photo) throw new Error(`photo introuvable : ${name}`);
        if (used.has(photo)) throw new Error(`photo imprimée deux fois : ${name}`);
        used.add(photo);
        return photo;
    };
    const byName = (name: string) => take(name, (p) => nfc(p.src.split('/').at(-1)!) === nfc(name));

    const opening = plan?.hero ? byName(plan.hero)
        : site.hero ? take(site.hero, (p) => nfc(p.src) === nfc(site.hero!))
        : photos[0] && take(photos[0].src, (p) => p === photos[0]);
    const focus = plan?.focus ?? site.focus;
    const hero = opening && { photo: opening, ...(focus && { focus }) };

    if (!plan) {
        const rest = photos.filter((p) => !used.has(p));
        const portrait = (p: P) => p.height > p.width;
        const pages: { layout: PageLayout['layout']; photos: P[] }[] = [];
        for (let i = 0; i < rest.length; i++) {
            const pair = rest[i + 1] && portrait(rest[i]) === portrait(rest[i + 1]);
            pages.push(pair ? { layout: 'pair', photos: [rest[i], rest[++i]] } : { layout: 'single', photos: [rest[i]] });
        }
        return { hero, pages };
    }

    const pages = (plan.pages ?? []).map(({ photos: names, ...page }) => {
        if (!Object.hasOwn(PER_PAGE, page.layout)) throw new Error(`mise en page inconnue : ${page.layout}`);
        if (names.length !== PER_PAGE[page.layout]) throw new Error(`${page.layout} : ${PER_PAGE[page.layout]} photo(s) attendue(s), ${names.length} donnée(s)`);
        return { ...page, photos: names.map(byName) };
    });
    return { hero, pages, ...(plan.spare && { spare: byName(plan.spare) }) };
}

/**
 * Pages intercalaires. Une lettre s'ouvre sur une page paire (photo d'ouverture à gauche), ou impaire
 * si elle n'a pas de photo d'ouverture. D'après une mise en page sans intercalaire (`start` : page
 * de partie qui précède la première lettre, `end` : dernière page de chaque lettre), dit devant
 * quelles lettres en insérer une, de combien de pages chaque lettre est décalée, et s'il faut une
 * page finale pour que le livre ait un nombre pair de pages. Une page insérée décale tout ce qui suit
 * sans changer la composition : le bloc de texte a la même largeur à gauche et à droite.
 */
export function pageFillers(
    letters: { id: string; hero: boolean; end: number }[],
    start: number
): { fillers: string[]; offsets: Record<string, number>; closing: boolean } {
    const fillers: string[] = [];
    const offsets: Record<string, number> = {};
    let offset = 0;
    let previous = start;
    for (const { id, hero, end } of letters) {
        const opening = previous + offset + 1;
        if ((opening % 2 === 0) !== hero) {
            fillers.push(id);
            offset++;
        }
        offsets[id] = offset;
        previous = end;
    }
    const last = letters.at(-1);
    return { fillers, offsets, closing: last ? (last.end + offset) % 2 === 1 : false };
}
