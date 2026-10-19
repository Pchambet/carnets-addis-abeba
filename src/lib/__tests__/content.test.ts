import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import { getSortedLettersData } from '../letters';
import { getLetterThemeMap, getThemeLetterCounts } from '../jardin';
import { THEMES } from '../themes';
import { isKnownLocation, splitLocation } from '../map-locations';
import { findThumb, getLetterCover, getVideosForLetter, listFiles, listMedia } from '../photos';

// Cohérence du contenu : tout ce qu'il faut compléter à la main quand une lettre est ajoutée.

const letters = getSortedLettersData();
const letterIds = new Set(letters.map((l) => l.id));
const themeSlugs = new Set(THEMES.map((t) => t.slug));
const imagesDir = path.join(process.cwd(), 'public', 'images');

describe('letters', () => {
    it.each(letters.map((l) => [l.id, l] as const))('%s has a complete frontmatter', (_, letter) => {
        expect(letter.title).toBeTruthy();
        expect(letter.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(letter.location).toBeTruthy();
    });

    it.each(letters.map((l) => [l.id, l.location] as const))('%s: every place is on the map', (_, location) => {
        for (const place of splitLocation(location)) {
            expect(isKnownLocation(place), `add "${place}" to src/lib/map-locations.ts`).toBe(true);
        }
    });

    // Extrait et citation mise en avant s'affichent entre guillemets : ce sont les mots exacts de Claire
    it.each(letters.map((l) => [l.id] as const))('%s: excerpt and pull quote are quoted word for word', (id) => {
        const { content, data } = matter(fs.readFileSync(path.join(process.cwd(), 'content', 'letters', `${id}.md`), 'utf8'));
        const flat = (s: string) => s.replace(/\*+/g, '').replace(/[\s ]+/g, ' ').trim();
        const pq = content.match(/^>\s*PQ:\s*(.+)$/m)?.[1];
        const body = flat(content.replace(/^>\s*PQ:.*$/m, ''));
        for (const quote of [data.excerpt, pq].filter(Boolean)) {
            expect(body, `${id}: « ${quote} »`).toContain(flat(quote));
        }
    });

    it.each(letters.filter((l) => l.heroImage).map((l) => [l.id, l.heroImage!] as const))(
        '%s: hero image exists',
        (_, heroImage) => {
            expect(fs.existsSync(path.join(process.cwd(), 'public', heroImage))).toBe(true);
        }
    );
});

describe('jardin', () => {
    const themeMap = getLetterThemeMap();

    it('every letter belongs to at least one theme', () => {
        const missing = [...letterIds].filter((id) => !themeMap[id]?.length);
        expect(missing, 'add them to content/letter-themes.json').toEqual([]);
    });

    it('letter-themes.json only references existing letters and themes', () => {
        for (const [id, slugs] of Object.entries(themeMap)) {
            expect(letterIds.has(id), id).toBe(true);
            for (const slug of slugs) expect(themeSlugs.has(slug), `${id}: ${slug}`).toBe(true);
        }
    });

    it('parcours-initiatique.json only references existing letters and themes', () => {
        const journeys = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'content', 'parcours-initiatique.json'), 'utf8')
        ) as { theme: string; questions: { letters: string[] }[] }[];
        for (const journey of journeys) {
            expect(themeSlugs.has(journey.theme), journey.theme).toBe(true);
            for (const id of journey.questions.flatMap((q) => q.letters)) {
                expect(letterIds.has(id), `${journey.theme}: ${id}`).toBe(true);
                expect(themeMap[id], `${id} answers a question of ${journey.theme}`).toContain(journey.theme);
            }
        }
        for (const journey of journeys) {
            const reachable = new Set(journey.questions.flatMap((q) => q.letters));
            expect(getThemeLetterCounts()[journey.theme], `${journey.theme}: count shown on /jardin`).toBe(reachable.size);
        }
        const answered = new Set(journeys.flatMap((j) => j.questions.flatMap((q) => q.letters)));
        const missing = [...letterIds].filter((id) => !answered.has(id));
        expect(missing, 'add them to a question of content/parcours-initiatique.json').toEqual([]);
    });
});

describe('media', () => {
    // Noms exacts (casse comprise) : le serveur de production y est sensible, pas le disque du Mac
    const existsExactly = (url: string) => {
        const file = path.join(process.cwd(), 'public', decodeURI(url));
        const names = fs.readdirSync(path.dirname(file)).map((f) => f.normalize('NFC'));
        return names.includes(path.basename(file).normalize('NFC'));
    };

    it.each(letters.map((l) => [l.id, l] as const))('%s: cover thumbnail exists with its exact name', (id, letter) => {
        const cover = getLetterCover(id, letter.heroImage);
        if (cover) expect(existsExactly(cover), cover).toBe(true);
    });

    it.each(letters.map((l) => [l.id] as const))('%s: every photo has a thumbnail with its exact name', (id) => {
        const files = listFiles(path.join(imagesDir, id));
        const photos = listMedia(files);
        for (const photo of photos) {
            const thumb = findThumb(files, photo);
            expect(thumb, `${photo}: run npm run media`).toBeTruthy();
            expect(existsExactly(`/images/${id}/${thumb}`), `${id}/${thumb}`).toBe(true);
        }
    });

    it.each(letters.map((l) => [l.id] as const))('%s: every video has a poster', (id) => {
        for (const video of getVideosForLetter(id)) expect(video.poster, video.src).toBeTruthy();
    });

    it.each(letters.map((l) => [l.id] as const))('%s: every caption names an existing file', (id) => {
        const file = path.join(imagesDir, id, 'captions.json');
        if (!fs.existsSync(file)) return;
        const files = listFiles(path.join(imagesDir, id));
        for (const name of Object.keys(JSON.parse(fs.readFileSync(file, 'utf8')))) {
            // NFC comme les chemins de git : sur Vercel (Linux), une clé NFD ne trouverait pas son fichier
            expect(name, `${id}/captions.json: key must be NFC`).toBe(name.normalize('NFC'));
            expect(files.has(name.normalize('NFC')), `${id}/captions.json: ${name}`).toBe(true);
        }
    });

    it('public/images only holds web media', () => {
        const stray = fs.readdirSync(imagesDir, { recursive: true, encoding: 'utf8' })
            .filter((f) => fs.statSync(path.join(imagesDir, f)).isFile())
            .filter((f) => !/\.(jpe?g|png|webp|mp4|webm)$|captions\.json$/i.test(f));
        expect(stray).toEqual([]);
    });
});
