/**
 * Livre papier (impression BoD, 21 × 21 cm) : composé par Typst à partir des lettres et photos du site.
 *
 *   npm run book                                  → book/build/livre.pdf
 *   npm run book -- --only semaine-12,semaine-46  → échantillon de quelques lettres
 *   npm run book -- --png                         → en plus, une image par page dans book/build/pages/
 *
 * Photos : celles que book/layout.json choisit et met en page pour chaque lettre (docs/LIVRE.md) ;
 * sans plan, toutes, deux par page quand leurs orientations s'accordent.
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { parseArgs } from 'util';
import matter from 'gray-matter';
import sharp from 'sharp';
import { cleanMarkdown, extractPullQuote, weekLabel } from '../src/lib/letters';
import { getPhotosForLetter, type Photo } from '../src/lib/photos';
import { arrange, bookTypography, cover, dateLabel, editPhotos, pageFillers, toBlocks, type LetterLayout, type PageLayout, type PrintPhoto } from './book-data';

const ROOT = process.cwd();
const BOOK = path.join(ROOT, 'book');
const BUILD = path.join(BOOK, 'build');
const LETTERS = path.join(ROOT, 'content', 'letters');

// Géométrie en mm, depuis le bord de coupe (le fond perdu s'y ajoute). Lue aussi par book/book.typ.
const geometry = {
    trim: 210,
    bleed: 5, // BoD : 5 mm tout autour dès qu'une image touche le bord
    // Bloc de 110 × 139,5 mm : 26 lignes de 15,5 pt, environ 74 signes par ligne
    text: { inside: 36, outside: 64, top: 28, bottom: 42.5 },
    // Page de titre d'une lettre : la date tombe sur cette ligne de la grille, le texte deux lignes plus bas
    // (l'introduction, plus longue qu'une page, commence plus haut pour tenir sur deux)
    opener: { line: 13, intro: 8 },
    // Photos encadrées : marges égales à gauche et à droite ; le haut des groupes s'aligne sur la
    // première ligne de texte, le blanc va en bas
    photos: { side: 24, top: 28, bottom: 30 },
    small: 112, // côté du cadre d'une photo « small »
    gap: 4,
    // Légendes (7,5 pt italique) : 1re ligne écart compris, lignes suivantes, largeur d'un caractère, avec de la marge
    caption: { first: 5, line: 3.5, charWidth: 1.2, gap: 1.6 },
};
const page = { width: geometry.trim + 2 * geometry.bleed, height: geometry.trim + 2 * geometry.bleed };
const framed = {
    width: geometry.trim - 2 * geometry.photos.side,
    height: geometry.trim - geometry.photos.top - geometry.photos.bottom,
};
// Page creuse : moins de cinq lignes (5,5 mm chacune), puis la signature ou le losange
const SHORT_PAGE = 37;
// BoD recommande 300 dpi ; en dessous de 220, une photo imprimée paraît molle
const PRINT_DPI = 300;
const MIN_DPI = 220;
// Dossiers bruts de Claire (../Semaine_XX, ../Retour…) : on y lit les originaux, sans jamais les modifier
const RAW = path.dirname(ROOT);
const ORIGINALS = path.join(BUILD, 'originals');

const IMAGE_EXT = /^\.(jpe?g|png|heic|heif|webp)$/i;
const HEIC_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1', 'heim', 'heis']);

function head(file: string, bytes: number): Buffer {
    const buffer = Buffer.alloc(bytes);
    const fd = fs.openSync(file, 'r');
    fs.readSync(fd, buffer, 0, bytes, 0);
    fs.closeSync(fd);
    return buffer;
}

/** Format réel, que Typst ne devine pas : scripts/media.mjs écrit du JPEG même sous un nom en .png */
function imageFormat(file: string): PrintPhoto['format'] | 'heic' | undefined {
    const bytes = head(file, 12);
    if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpg';
    if (bytes.toString('latin1', 1, 4) === 'PNG') return 'png';
    if (bytes.toString('latin1', 0, 4) === 'RIFF') return 'webp';
    if (bytes.toString('latin1', 4, 8) === 'ftyp' && HEIC_BRANDS.has(bytes.toString('latin1', 8, 12))) return 'heic';
}

const printable = (p: Photo): PrintPhoto => {
    const format = imageFormat(path.join(ROOT, 'public', p.src));
    if (!format || format === 'heic') throw new Error(`public${p.src} : format d'image non imprimable`);
    return {
        src: `/public${p.src}`,
        width: p.width!,
        height: p.height!,
        format,
        ...(p.caption && { caption: bookTypography(p.caption) }),
    };
};

/**
 * Clé d'une photo pour retrouver son original : nom sans extension d'image, sans accents ni
 * ponctuation. « Partage_ » (HEIC sans extension) ↔ « Partage.jpg », « Grad Eliab 1.JPG » ↔
 * « grad-eliab-1.jpg » (noms simplifiés sur le site), « Libertés.jpg » ↔ « Libertes.jpg », « Cœur » ↔ « coeur.jpg ».
 */
function photoKey(file: string): string {
    const ext = path.extname(file);
    const base = IMAGE_EXT.test(ext) ? path.basename(file, ext) : path.basename(file);
    return base.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Fichiers bruts de Claire, par dossier (Semaine_00, Retour…) puis par clé. Tous les fichiers : une
 * vidéo ou un document garde son extension dans sa clé, et seul le contenu dit si c'est une image.
 */
function rawPhotos(): Map<string, string[]>[] {
    return fs.readdirSync(RAW, { withFileTypes: true })
        .filter((dir) => dir.isDirectory() && !dir.name.startsWith('.') && path.join(RAW, dir.name) !== ROOT)
        .map((dir) => {
            const byKey = new Map<string, string[]>();
            for (const entry of fs.readdirSync(path.join(RAW, dir.name), { recursive: true, withFileTypes: true })) {
                if (!entry.isFile() || entry.name.startsWith('.')) continue;
                const file = path.join(entry.parentPath, entry.name);
                byKey.set(photoKey(file), [...(byKey.get(photoKey(file)) ?? []), file]);
            }
            return byKey;
        });
}

/**
 * Fichier à imprimer pour une photo dont le grand côté mesure `mm` sur la page : l'original de
 * Claire, réduit à 300 dpi, s'il est plus grand que la version du site et de mêmes proportions
 * (sinon c'est une autre retouche) ; à défaut, la version du site.
 */
async function printFile(id: string, originals: string[], photo: PrintPhoto, mm: number, warnings: string[]) {
    const px = Math.ceil((mm / 25.4) * PRINT_DPI);
    // Même extension que la version du site d'abord : un PNG retouché passe avant le HEIC de même nom
    const ext = path.extname(photo.src).toLowerCase();
    const ordered = [...originals].sort((a, b) => Number(path.extname(b).toLowerCase() === ext) - Number(path.extname(a).toLowerCase() === ext));
    for (const original of ordered) {
        const kind = imageFormat(original);
        if (!kind || kind === 'webp') continue;
        const out = path.join(ORIGINALS, id, `${photoKey(original)}-${px}.jpg`);
        if (!fs.existsSync(out)) {
            fs.mkdirSync(path.dirname(out), { recursive: true });
            // sharp ne lit pas le HEIC : sips (macOS) le convertit d'abord
            const input = kind === 'heic' ? `${out}.tmp.jpg` : original;
            try {
                if (kind === 'heic') execFileSync('sips', ['-s', 'format', 'jpeg', original, '--out', input], { stdio: 'ignore' });
                const { width = 0, height = 0, orientation = 1 } = await sharp(input).metadata();
                const [w, h] = orientation >= 5 ? [height, width] : [width, height];
                if (Math.max(w, h) <= Math.max(photo.width, photo.height) || Math.abs((w / h) / (photo.width / photo.height) - 1) > 0.015) continue;
                // Fond blanc sous un PNG transparent (le JPEG n'a pas de transparence)
                await sharp(input).rotate().flatten({ background: '#ffffff' })
                    .resize({ width: px, height: px, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 92 }).toFile(out);
            } catch (error) {
                warnings.push(`${id} : original illisible, ${path.relative(RAW, original)} (${(error as Error).message.split('\n')[0]})`);
                continue;
            } finally {
                if (kind === 'heic') fs.rmSync(input, { force: true });
            }
        }
        const { width = 0 } = await sharp(out).metadata();
        return { src: `/${path.relative(ROOT, out)}`, format: 'jpg' as const, width, out };
    }
    return { src: photo.src, format: photo.format, width: photo.width };
}

/** Photo posée sur une page : fichier et taille imprimée */
type Placed = { src: string; format?: PrintPhoto['format']; w: number; h: number };

/** Page de photos : une à fond perdu, recadrée, ou de 1 à 3 photos entières sur fond blanc */
function photoPage({ layout, size, focus, photos }: Omit<PageLayout, 'photos'> & { photos: PrintPhoto[] }) {
    if (layout === 'full') {
        const [{ src, format, ...image }] = photos;
        return { t: 'full' as const, src, format, ...cover(image, page, focus) };
    }
    const box = size === 'small' ? { width: geometry.small, height: geometry.small } : framed;
    const group = arrange(photos, box, geometry);
    const x = (geometry.trim - group.width) / 2;
    return { t: 'framed' as const, cells: group.cells.map((c) => ({ ...c, x: c.x + x, y: c.y + geometry.photos.top })) };
}

async function letter(file: string, layouts: Record<string, LetterLayout>, raw: Map<string, string[]>[], warnings: string[]) {
    const id = file.replace(/\.md$/, '');
    const { data, content } = matter(fs.readFileSync(path.join(LETTERS, file), 'utf8'));
    const photos = (await getPhotosForLetter(id, { blur: false })).map(printable);
    let edit;
    try {
        edit = editPhotos(photos, layouts[id], { hero: data.heroImage && `/public${data.heroImage}`, focus: data.heroPosition });
    } catch (error) {
        throw new Error(`${id} (heroImage ou book/layout.json) : ${(error as Error).message}`);
    }
    const hero = edit.hero && { src: edit.hero.photo.src, format: edit.hero.photo.format, ...cover(edit.hero.photo, page, edit.hero.focus) };
    const pages = edit.pages.map(photoPage);
    const spare = edit.spare && photoPage({ layout: 'single', photos: [edit.spare] });

    // Impression : chaque photo posée prend l'original de Claire quand il est plus fin. Son dossier
    // brut est celui qui contient le plus de photos de la lettre.
    const folder = raw.reduce<Map<string, string[]> | undefined>((best, byStem) => {
        const found = (m?: Map<string, string[]>) => photos.filter((p) => m?.has(photoKey(p.src))).length;
        return found(byStem) > found(best) ? byStem : best;
    }, undefined);
    const images = [
        ...(hero ? [hero] : []),
        ...[...pages, ...(spare ? [spare] : [])].flatMap<Placed>((p) => (p.t === 'framed' ? p.cells : [p])),
    ];
    const used = new Set<string>();
    for (const image of images) {
        const photo = photos.find((p) => p.src === image.src)!;
        const print = await printFile(id, folder?.get(photoKey(photo.src)) ?? [], photo, Math.max(image.w, image.h), warnings);
        const dpi = print.width / (image.w / 25.4);
        if (dpi < MIN_DPI) warnings.push(`${id} : ${path.basename(photo.src)} imprimée à ${Math.round(dpi)} dpi (moins de ${MIN_DPI})`);
        if (print.out) used.add(path.basename(print.out).toLowerCase());
        Object.assign(image, { src: print.src, format: print.format });
    }
    // Originaux d'une mise en page précédente (noms comparés sans casse, comme le disque du Mac)
    const cache = path.join(ORIGINALS, id);
    if (fs.existsSync(cache)) {
        for (const name of fs.readdirSync(cache)) if (!used.has(name.toLowerCase())) fs.rmSync(path.join(cache, name));
    }

    const dateline = `${data.location ? `${data.location}, le` : 'Le'} ${dateLabel(data.date)}`;
    return {
        id,
        date: data.date as string,
        week: weekLabel(id),
        title: bookTypography(data.title),
        dateline: bookTypography(dateline),
        hero,
        blocks: toBlocks(extractPullQuote(cleanMarkdown(content)).cleanContent),
        pages,
        spare,
        ...(layouts[id]?.fit && { fit: layouts[id].fit }),
    };
}

/** « octobre 2025 – octobre 2026 » : du mois de la première lettre à celui de la dernière */
function span(dates: string[]): string {
    const month = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const [first, last] = [month(dates[0]), month(dates.at(-1)!)];
    return first === last ? first : `${first} – ${last}`;
}

async function main() {
    const { values: args } = parseArgs({ options: { only: { type: 'string' }, png: { type: 'boolean' } } });
    const only = args.only?.split(',') ?? null;
    const layouts: Record<string, LetterLayout> = fs.existsSync(path.join(BOOK, 'layout.json'))
        ? JSON.parse(fs.readFileSync(path.join(BOOK, 'layout.json'), 'utf8'))
        : {};

    const ids = fs.readdirSync(LETTERS).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
    for (const [option, names] of [['--only', only ?? []], ['book/layout.json', Object.keys(layouts)]] as const) {
        const unknown = names.filter((name) => !ids.includes(name));
        if (unknown.length) throw new Error(`${option} : lettre inconnue (${unknown.join(', ')})`);
    }
    const raw = rawPhotos();
    const warnings: string[] = [];
    const files = ids.filter((id) => !only || only.includes(id)).map((id) => `${id}.md`);
    const letters = (await Promise.all(files.map((file) => letter(file, layouts, raw, warnings)))).sort((a, b) => a.date.localeCompare(b.date));

    fs.mkdirSync(BUILD, { recursive: true });
    const intro = toBlocks(cleanMarkdown(fs.readFileSync(path.join(BOOK, 'introduction.md'), 'utf8')));

    const typst = (command: 'compile' | 'eval', ...extra: string[]) => {
        try {
            return execFileSync('typst', [command, '--root', ROOT, '--font-path', path.join(BOOK, 'fonts'), '--ignore-system-fonts', ...extra], {
                encoding: 'utf8',
                stdio: ['ignore', command === 'eval' ? 'pipe' : 'inherit', 'inherit'],
            });
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new Error('Typst introuvable : brew install typst');
            throw error;
        }
    };
    const source = path.join(BOOK, 'book.typ');
    const write = (extra: object) => fs.writeFileSync(path.join(BUILD, 'book.json'), JSON.stringify({ geometry, intro, span: span(letters.map((l) => l.date)), letters, ...extra }));

    // 1. Mise en page sans page intercalaire : où finit chaque lettre. Typst ne peut pas le décider
    // lui-même : chaque intercalaire dépend du précédent, et 40 lettres dépassent ses 5 passes.
    write({});
    const draft: {
        part: number;
        ends: { letter: string; page: number }[];
        full: { letter: string; page: number }[];
        text: { letter: string; page: number; y: number; opener: number }[];
    } = JSON.parse(typst('eval', `(
        part: query(<part>).first().location().page(),
        ends: query(<letter-end>).map(it => (letter: it.value, page: it.location().page())),
        full: query(<full-page>).map(it => it.value),
        text: query(<text-end>).map(it => it.value),
    )`, '--in', source));
    const ends = new Map(draft.ends.map((e) => [e.letter, e.page]));
    const plan = pageFillers(letters.map((l) => ({ id: l.id, hero: Boolean(l.hero), end: ends.get(l.id)! })), draft.part);

    // 2. Le livre, avec ses intercalaires
    write({ letters: letters.map((l) => ({ ...l, ...(plan.fillers.includes(l.id) && { filler: true }) })), closing: plan.closing });
    typst('compile', source, path.join(BUILD, 'livre.pdf'));
    if (args.png) {
        fs.rmSync(path.join(BUILD, 'pages'), { recursive: true, force: true });
        fs.mkdirSync(path.join(BUILD, 'pages'));
        typst('compile', '--format', 'png', '--ppi', '100', source, path.join(BUILD, 'pages', '{0p}.png'));
    }
    // Une pleine page à gauche, parmi les photos d'une lettre, se lit comme l'ouverture d'une autre
    // (pages du premier passage, décalées des intercalaires)
    for (const { letter, page } of draft.full.map((f) => ({ ...f, page: f.page + plan.offsets[f.letter] })).filter((f) => f.page % 2 === 0)) {
        warnings.push(`${letter} : pleine page à gauche (p. ${page}), qui se lit comme une ouverture ; la mettre sur une page de droite (book/layout.json)`);
    }
    // Page creuse : la fin d'une lettre seule en haut d'une page (moins de cinq lignes)
    for (const { letter, page } of draft.text.filter((e) => e.page !== e.opener && e.y < geometry.text.top + SHORT_PAGE)) {
        warnings.push(`${letter} : la fin du texte reste seule en haut de la p. ${page + plan.offsets[letter]} ; essayer "fit": "loose" ou "tight" (book/layout.json)`);
    }

    const pages = letters.flatMap((l) => l.pages);
    const photoCount = letters.reduce((n, l) => n + (l.hero ? 1 : 0) + l.pages.reduce((m, p) => m + (p.t === 'framed' ? p.cells.length : 1), 0), 0);
    const spares = letters.filter((l) => l.spare).length;
    console.log(`book/build/livre.pdf : ${letters.length} lettre(s), ${photoCount} photo(s) sur ${pages.length} page(s), plus ${spares} de réserve (imprimées si la parité l'exige)`);
    for (const warning of warnings.sort()) console.warn(`⚠ ${warning}`);
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
