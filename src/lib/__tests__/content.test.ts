import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { getSortedLettersData } from '../letters';
import { getLetterThemeMap } from '../jardin';
import { THEMES } from '../themes';
import { isKnownLocation, splitLocation } from '../map-locations';

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
            }
        }
    });
});

describe('media', () => {
    it('public/images only holds web media', () => {
        const stray = fs.readdirSync(imagesDir, { recursive: true, encoding: 'utf8' })
            .filter((f) => fs.statSync(path.join(imagesDir, f)).isFile())
            .filter((f) => !/\.(jpe?g|png|webp|mp4|webm)$|captions\.json$/i.test(f));
        expect(stray).toEqual([]);
    });
});
