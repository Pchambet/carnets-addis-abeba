/**
 * Livre papier (impression BoD, 21 × 21 cm) : composé par Typst à partir des lettres et photos du site.
 *
 *   npm run book                                  → book/build/livre.pdf
 *   npm run book -- --only semaine-12,semaine-46  → échantillon de quelques lettres
 *   npm run book -- --png                         → en plus, une image par page dans book/build/pages/
 *
 * Photos : toutes celles de la lettre, sauf si book/photos.json en choisit (et ordonne) certaines :
 *   { "semaine-12": ["photo 1.jpg", "photo 2.jpg"] }
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { parseArgs } from 'util';
import matter from 'gray-matter';
import { cleanMarkdown, extractPullQuote, weekLabel } from '../src/lib/letters';
import { getPhotosForLetter, type Photo } from '../src/lib/photos';
import { bookTypography, choosePhotos, dateLabel, heroFrame, layoutRows, paginate, toBlocks, type PrintPhoto } from './book-data';

const ROOT = process.cwd();
const BOOK = path.join(ROOT, 'book');
const BUILD = path.join(BOOK, 'build');
const LETTERS = path.join(ROOT, 'content', 'letters');

// Géométrie en mm, depuis le bord de coupe (le fond perdu s'y ajoute). Lue aussi par book/book.typ.
const geometry = {
    trim: 210,
    bleed: 5, // BoD : 5 mm tout autour dès qu'une image touche le bord
    text: { inside: 34, outside: 48, top: 26, bottom: 30 },
    photos: { inside: 22, outside: 22, top: 22, bottom: 28 },
    hero: { height: 100 },
    grid: { gap: 3, rowGap: 6, target: 50, maxPerRow: 3 },
    // Légendes (7,5 pt italique, mesuré dans Typst) : 1re ligne, lignes suivantes, largeur d'un caractère, avec de la marge
    caption: { first: 4, line: 3.5, charWidth: 1.2 },
};
const gridWidth = geometry.trim - geometry.photos.inside - geometry.photos.outside;
const gridHeight = geometry.trim - geometry.photos.top - geometry.photos.bottom;
const heroBox = { width: geometry.trim + 2 * geometry.bleed, height: geometry.hero.height + geometry.bleed };

/** Format réel, que Typst ne devine pas : scripts/media.mjs écrit du JPEG même sous un nom en .png */
function imageFormat(src: string): PrintPhoto['format'] {
    const head = Buffer.alloc(4);
    const fd = fs.openSync(path.join(ROOT, 'public', src), 'r');
    fs.readSync(fd, head, 0, 4, 0);
    fs.closeSync(fd);
    if (head[0] === 0xff && head[1] === 0xd8) return 'jpg';
    if (head.toString('latin1', 1, 4) === 'PNG') return 'png';
    if (head.toString('latin1', 0, 4) === 'RIFF') return 'webp';
    throw new Error(`public${src} : format d'image inconnu`);
}

const printable = (p: Photo): PrintPhoto => ({
    src: `/public${p.src}`,
    width: p.width!,
    height: p.height!,
    format: imageFormat(p.src),
    ...(p.caption && { caption: bookTypography(p.caption) }),
});

async function letter(file: string, selection: Record<string, string[]>) {
    const id = file.replace(/\.md$/, '');
    const { data, content } = matter(fs.readFileSync(path.join(LETTERS, file), 'utf8'));
    let photos;
    try {
        photos = choosePhotos(await getPhotosForLetter(id, { blur: false }), { hero: data.heroImage, chosen: selection[id] });
    } catch (error) {
        throw new Error(`${id} (heroImage ou book/photos.json) : ${(error as Error).message}`);
    }
    const hero = photos.hero && printable(photos.hero);

    return {
        id,
        date: data.date as string,
        week: weekLabel(id),
        title: bookTypography(data.title),
        dateLabel: dateLabel(data.date),
        location: data.location && bookTypography(data.location),
        hero: hero && { src: hero.src, format: hero.format, ...heroFrame(hero, heroBox, data.heroPosition) },
        blocks: toBlocks(extractPullQuote(cleanMarkdown(content)).cleanContent),
        photoPages: paginate(
            layoutRows(photos.grid.map(printable), { width: gridWidth, ...geometry.grid, maxHeight: gridHeight - 15 }),
            { height: gridHeight, gap: geometry.grid.rowGap, caption: geometry.caption }
        ),
    };
}

async function main() {
    const { values: args } = parseArgs({ options: { only: { type: 'string' }, png: { type: 'boolean' } } });
    const only = args.only?.split(',') ?? null;
    const selection: Record<string, string[]> = fs.existsSync(path.join(BOOK, 'photos.json'))
        ? JSON.parse(fs.readFileSync(path.join(BOOK, 'photos.json'), 'utf8'))
        : {};

    const ids = fs.readdirSync(LETTERS).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
    for (const [option, names] of [['--only', only ?? []], ['book/photos.json', Object.keys(selection)]] as const) {
        const unknown = names.filter((name) => !ids.includes(name));
        if (unknown.length) throw new Error(`${option} : lettre inconnue (${unknown.join(', ')})`);
    }
    const files = ids.filter((id) => !only || only.includes(id)).map((id) => `${id}.md`);
    const letters = (await Promise.all(files.map((file) => letter(file, selection)))).sort((a, b) => a.date.localeCompare(b.date));

    fs.mkdirSync(BUILD, { recursive: true });
    const intro = toBlocks(cleanMarkdown(fs.readFileSync(path.join(BOOK, 'introduction.md'), 'utf8')));
    fs.writeFileSync(path.join(BUILD, 'book.json'), JSON.stringify({ geometry, intro, letters }));

    const typst = (...extra: string[]) => {
        try {
            execFileSync('typst', ['compile', '--root', ROOT, '--font-path', path.join(BOOK, 'fonts'), '--ignore-system-fonts', ...extra], { stdio: 'inherit' });
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new Error('Typst introuvable : brew install typst');
            throw error;
        }
    };
    typst(path.join(BOOK, 'book.typ'), path.join(BUILD, 'livre.pdf'));
    if (args.png) {
        fs.rmSync(path.join(BUILD, 'pages'), { recursive: true, force: true });
        fs.mkdirSync(path.join(BUILD, 'pages'));
        typst('--format', 'png', '--ppi', '60', path.join(BOOK, 'book.typ'), path.join(BUILD, 'pages', '{0p}.png'));
    }
    const photoPages = letters.flatMap((l) => l.photoPages);
    const photoCount = photoPages.flat().reduce((n, r) => n + r.items.length, 0);
    console.log(`book/build/livre.pdf : ${letters.length} lettre(s), ${photoCount} photo(s) sur ${photoPages.length} page(s)`);
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
