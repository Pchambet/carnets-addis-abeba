import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import matter from 'gray-matter';
import { cleanMarkdown, extractPullQuote } from '@/lib/letters';
import { arrange, bookTypography, cover, dateLabel, editPhotos, pageFillers, toBlocks } from '../book-data';

describe('bookTypography', () => {
  it.each([
    ['l\'eau', 'l’eau'],
    ['avec mon père,  je reçois', 'avec mon père, je reçois'],
    ['et d’ immenses tableaux, puisqu’ il', 'et d’immenses tableaux, puisqu’il'],
    ['un Times up’ dont ils', 'un Times up’ dont ils'],
    ['de ‘l’occupationnel’ alors', 'de ‘l’occupationnel’ alors'],
    ["le mot 'occupationnel' revient", 'le mot ‘occupationnel’ revient'],
    ['si vous saviez...', 'si vous saviez…'],
    ['Où vas-tu ? Vers toi !', 'Où vas-tu\u202f? Vers toi\u202f!'],
    ['Où vas-tu? Vers toi!', 'Où vas-tu\u202f? Vers toi\u202f!'],
    ['Quoi ?!', 'Quoi\u202f?!'],
    ['« Papa »', '«\u202fPapa\u202f»'],
    ['«nouvelle fleur»', '«\u202fnouvelle fleur\u202f»'],
    ['«  Papa, je suis envoyée »', '«\u202fPapa, je suis envoyée\u202f»'],
    ['une phrase du saint : « À', 'une phrase du saint\u00a0: «\u202fÀ'],
    ['Mardi: le marché', 'Mardi\u00a0: le marché'],
    ['à 23h30, 10:30', 'à 23h30, 10:30'],
    ['Où tu vas ? - Vers l’Amour.', 'Où tu vas\u202f? – Vers l’Amour.'],
    ['- « C’est du bon travail', '– «\u202fC’est du bon travail'],
  ])('%s', (input, expected) => {
    expect(bookTypography(input)).toBe(expected);
  });

  it('only changes spacing and signs, never letters', () => {
    const text = 'Il pleut. C\'est une bonne chose ; vraiment... « Oui » !';
    const letters = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, '');
    expect(letters(bookTypography(text))).toBe(letters(text));
  });
});

describe('toBlocks', () => {
  it('keeps paragraphs with their emphasis', () => {
    expect(toBlocks('Chers amis,\n\nJe *vous* écris **enfin**.')).toEqual([
      { t: 'p', c: [{ t: 'text', v: 'Chers amis,' }] },
      {
        t: 'p',
        c: [
          { t: 'text', v: 'Je ' },
          { t: 'em', c: [{ t: 'text', v: 'vous' }] },
          { t: 'text', v: ' écris ' },
          { t: 'strong', c: [{ t: 'text', v: 'enfin' }] },
          { t: 'text', v: '.' },
        ],
      },
    ]);
  });

  it('turns a bold day name into a day header', () => {
    expect(toBlocks('**Mardi 28 octobre ~ Au marché**\n\nSuite.')[0]).toEqual({
      t: 'day', name: 'Mardi', date: '28 octobre', desc: 'Au marché',
    });
  });

  it('turns --- into a section break', () => {
    expect(toBlocks('Avant.\n\n---\n\nAprès.').map((b) => b.t)).toEqual(['p', 'break', 'p']);
  });

  it('reads a final « Claire » as the signature', () => {
    expect(toBlocks('Je vous embrasse.\n\nClaire').at(-1)).toEqual({ t: 'sign', v: 'Claire' });
    expect(toBlocks('Claire m’a dit bonjour.\n\nFin.').map((b) => b.t)).toEqual(['p', 'p']);
  });

  it('applies the book typography to the text', () => {
    expect(toBlocks('\\- « Viens ! »')).toEqual([{ t: 'p', c: [{ t: 'text', v: '– «\u202fViens\u202f!\u202f»' }] }]);
  });

  it('spaces punctuation that follows italics or bold', () => {
    expect(toBlocks('C’est *magnifique*! Tu es **sûre**?')).toEqual([{
      t: 'p',
      c: [
        { t: 'text', v: 'C’est ' },
        { t: 'em', c: [{ t: 'text', v: 'magnifique' }] },
        { t: 'text', v: '\u202f! Tu es ' },
        { t: 'strong', c: [{ t: 'text', v: 'sûre' }] },
        { t: 'text', v: '\u202f?' },
      ],
    }]);
  });

  it('keeps a bold day line with italics inside as text, word for word', () => {
    const [block] = toBlocks('**Mardi ~ visite au *marché* central**');
    expect(block.t).toBe('p');
    expect(JSON.stringify(block)).toContain('central');
  });

  it('refuses Markdown it cannot print rather than dropping it', () => {
    expect(() => toBlocks('# Titre')).toThrow(/heading/);
    expect(() => toBlocks('Texte avec [un lien](https://example.org).')).toThrow(/link/);
  });

  it('prints every letter of the site', () => {
    const dir = path.join(process.cwd(), 'content', 'letters');
    for (const file of fs.readdirSync(dir)) {
      const { cleanContent } = extractPullQuote(cleanMarkdown(matter(fs.readFileSync(path.join(dir, file), 'utf8')).content));
      expect(() => toBlocks(cleanContent), file).not.toThrow();
    }
  });
});

describe('dateLabel', () => {
  it.each([
    ['2026-10-18', '18 octobre 2026'],
    ['2025-11-01', '1er novembre 2025'],
  ])('%s → %s', (date, label) => {
    expect(dateLabel(date)).toBe(label);
  });
});

describe('cover', () => {
  const page = { width: 220, height: 220 };

  it('fills the box and shows the requested part of a tall photo', () => {
    expect(cover({ width: 1000, height: 1500 }, page, 'center bottom')).toEqual({ w: 220, h: 330, dx: 0, dy: -110 });
    expect(cover({ width: 1000, height: 1500 }, page, '50% 10%').dy).toBeCloseTo(-11, 6);
    expect(cover({ width: 1000, height: 1500 }, page).dy).toBeCloseTo(-55, 6);
  });

  it('keeps the requested side of a wide photo', () => {
    expect(cover({ width: 1500, height: 1000 }, page, '0% 50%')).toMatchObject({ w: 330, h: 220, dy: 0 });
    expect(cover({ width: 1500, height: 1000 }, page, '0% 50%').dx).toBeCloseTo(0, 6);
    expect(cover({ width: 1500, height: 1000 }, page, '75% 20%').dx).toBeCloseTo(-82.5, 6);
    expect(cover({ width: 1500, height: 1000 }, page, 'right').dx).toBeCloseTo(-110, 6);
  });

  it('reads the site’s CSS positions and refuses the others', () => {
    expect(cover({ width: 1000, height: 1500 }, page, 'bottom').dy).toBeCloseTo(-110, 6);
    expect(cover({ width: 1000, height: 1500 }, page, 'center 20%').dy).toBeCloseTo(-22, 6);
    expect(() => cover({ width: 1000, height: 1500 }, page, 'haut')).toThrow(/haut/);
    expect(() => cover({ width: 1000, height: 1500 }, page, 'constructor')).toThrow(/constructor/);
  });
});

describe('arrange', () => {
  const box = { width: 160, height: 150 };
  const opts = { gap: 4, caption: { first: 5, line: 3.5, charWidth: 1.2 } };
  const photo = (width: number, height: number, caption?: string) => ({ src: `${width}x${height}`, width, height, caption });
  const portrait = photo(1000, 1500);
  const landscape = photo(1500, 1000);

  const checkFits = (group: ReturnType<typeof arrange>, photos: ReturnType<typeof photo>[]) => {
    expect(group.width).toBeLessThanOrEqual(box.width + 1e-6);
    expect(group.height).toBeLessThanOrEqual(box.height + 1e-6);
    group.cells.forEach((c, i) => {
      expect(c.src).toBe(photos[i].src);
      expect(c.w / c.h).toBeCloseTo(photos[i].width / photos[i].height, 6);
      expect(c.x).toBeGreaterThanOrEqual(-1e-6);
      expect(c.x + c.w).toBeLessThanOrEqual(group.width + 1e-6);
      group.cells.slice(i + 1).forEach((d) => {
        const apart = c.x + c.w <= d.x + 1e-6 || d.x + d.w <= c.x + 1e-6 || c.y + c.h <= d.y + 1e-6 || d.y + d.h <= c.y + 1e-6;
        expect(apart).toBe(true);
      });
    });
  };

  it('prints a single photo as large as the box allows, uncropped', () => {
    expect(arrange([landscape], box, opts)).toMatchObject({ width: 160, cells: [{ w: 160 }] });
    const tall = arrange([portrait], box, opts);
    expect(tall.height).toBeCloseTo(150, 6);
    expect(tall.cells[0].h).toBeCloseTo(150, 6);
  });

  it('sets two portraits side by side and stacks two landscapes', () => {
    const portraits = arrange([portrait, portrait], box, opts);
    expect(portraits.cells[0].y).toBe(portraits.cells[1].y);
    const landscapes = arrange([landscape, landscape], box, opts);
    expect(landscapes.cells[0].x).toBe(landscapes.cells[1].x);
    checkFits(portraits, [portrait, portrait]);
    checkFits(landscapes, [landscape, landscape]);
  });

  it('gives three photos the arrangement that prints them largest, first photo the biggest', () => {
    for (const trio of [[landscape, portrait, portrait], [portrait, landscape, landscape], [landscape, landscape, landscape], [portrait, portrait, portrait]]) {
      const group = arrange(trio, box, opts);
      checkFits(group, trio);
      const areas = group.cells.map((c) => c.w * c.h);
      expect(areas[0]).toBeGreaterThanOrEqual(Math.max(...areas.slice(1)) - 1e-6);
      // A plain row or column never beats it
      const row = (box.width - 2 * opts.gap) / trio.reduce((s, p) => s + p.width / p.height, 0);
      expect(areas.reduce((s, a) => s + a, 0)).toBeGreaterThanOrEqual(trio.reduce((s, p) => s + row * row * (p.width / p.height), 0) - 1e-6);
    }
  });

  it('keeps room under each image for its caption, on several lines if needed', () => {
    const long = 'Les sœurs et les jeunes filles du foyer, un soir de fête, autour de la table du réfectoire';
    const photos = [photo(1500, 1000, 'Partage'), photo(1500, 1000, long)];
    const group = arrange(photos, box, opts);
    checkFits(group, photos);
    const [first, second] = group.cells;
    expect(second.y - (first.y + first.h)).toBeGreaterThanOrEqual(opts.caption.first + opts.gap - 1e-6);
    const lines = Math.ceil((long.length * opts.caption.charWidth) / second.w);
    expect(lines).toBeGreaterThan(1);
    expect(group.height - (second.y + second.h)).toBeCloseTo(opts.caption.first + (lines - 1) * opts.caption.line, 6);
  });

  it('widens the gutters between columns to match those that hold captions', () => {
    // Sans légende : la paire de portraits sous le paysage reste à l'écart ordinaire
    const plain = arrange([landscape, portrait, portrait], box, opts).cells;
    expect(plain[2].x - (plain[1].x + plain[1].w)).toBeCloseTo(opts.gap, 6);
    const trio = [photo(1000, 1500, 'Rencontre avec les sœurs'), photo(1500, 1000, 'Apprivoisements'), photo(1500, 1000, 'Libertés')];
    const [big, top, bottom] = arrange(trio, box, opts).cells;
    const vertical = bottom.y - (top.y + top.h);
    expect(top.x - (big.x + big.w)).toBeCloseTo(vertical, 6);
  });

  it('aligns the images of a row even when only one has a caption', () => {
    const photos = [photo(1000, 1500, 'Libertés'), photo(1000, 1500)];
    const [a, b] = arrange(photos, box, opts).cells;
    expect(a.h).toBeCloseTo(b.h, 6);
  });
});

describe('editPhotos', () => {
  const photo = (file: string, width = 1500, height = 1000) => ({ src: `/images/s/${file}`, width, height });
  const photos = [photo('a.jpg'), photo('b.jpg', 1000, 1500), photo('c.jpg', 1000, 1500), photo('d.jpg'), photo('é.jpg')];
  const names = (list: { src: string }[]) => list.map((p) => p.src.split('/').at(-1));

  it('follows the editor’s plan: hero, pages in order, spare', () => {
    const edit = editPhotos(photos, {
      hero: 'd.jpg',
      focus: '30% 50%',
      pages: [{ layout: 'pair', photos: ['b.jpg', 'c.jpg'] }, { layout: 'single', size: 'small', photos: ['a.jpg'] }],
      spare: 'é.jpg',
    }, {});
    expect(edit.hero).toEqual({ photo: photos[3], focus: '30% 50%' });
    expect(edit.pages.map((p) => [p.layout, p.size, names(p.photos)])).toEqual([['pair', undefined, ['b.jpg', 'c.jpg']], ['single', 'small', ['a.jpg']]]);
    expect(edit.spare).toBe(photos[4]);
  });

  it('opens on the site’s hero image when the plan does not name one', () => {
    const edit = editPhotos(photos, { pages: [] }, { hero: '/images/s/c.jpg', focus: 'center 20%' });
    expect(edit.hero).toEqual({ photo: photos[2], focus: 'center 20%' });
  });

  it('without a plan, keeps every photo once: pairs of the same orientation, otherwise singles', () => {
    const edit = editPhotos(photos, undefined, { hero: '/images/s/a.jpg' });
    expect(names([edit.hero!.photo])).toEqual(['a.jpg']);
    expect(edit.pages.map((p) => [p.layout, names(p.photos)])).toEqual([['pair', ['b.jpg', 'c.jpg']], ['pair', ['d.jpg', 'é.jpg']]]);
    expect(editPhotos(photos, undefined, {}).hero!.photo).toBe(photos[0]);
  });

  it('refuses a plan it cannot print as written', () => {
    const plan = (pages: unknown, extra = {}) => ({ hero: 'a.jpg', pages, ...extra }) as Parameters<typeof editPhotos>[1];
    expect(() => editPhotos(photos, plan([{ layout: 'single', photos: ['z.jpg'] }]), {})).toThrow(/z\.jpg/);
    expect(() => editPhotos(photos, plan([{ layout: 'pair', photos: ['b.jpg'] }]), {})).toThrow(/pair/);
    expect(() => editPhotos(photos, plan([{ layout: 'mosaic', photos: ['b.jpg'] }]), {})).toThrow(/mosaic/);
    expect(() => editPhotos(photos, plan([{ layout: 'toString', photos: ['b.jpg'] }]), {})).toThrow(/inconnue : toString/);
    expect(() => editPhotos(photos, plan([{ layout: 'single', photos: ['a.jpg'] }]), {})).toThrow(/a\.jpg/);
    expect(() => editPhotos(photos, plan([], { spare: 'a.jpg' }), {})).toThrow(/a\.jpg/);
  });
});

describe('pageFillers', () => {
  // Mise en page sans intercalaire : page de partie p. 9, dernière page de chaque lettre
  const letter = (id: string, end: number, hero = true) => ({ id, end, hero });

  it('adds nothing when every letter already opens on a left page', () => {
    expect(pageFillers([letter('a', 15), letter('b', 26)], 9)).toEqual({ fillers: [], offsets: { a: 0, b: 0 }, closing: false });
  });

  it('adds a page before a letter whose predecessor ends on a left page, and shifts what follows', () => {
    // a finit p. 16 : b s'ouvrirait p. 17, à droite → intercalaire ; b passe de 17-26 à 18-27,
    // et c, qui s'ouvrait p. 27 (à droite), s'ouvre désormais p. 28 sans autre intercalaire
    const plan = pageFillers([letter('a', 16), letter('b', 26), letter('c', 31)], 9);
    expect(plan.fillers).toEqual(['b']);
    expect(plan.offsets).toEqual({ a: 0, b: 1, c: 1 });
    // c finit p. 32 : le total est pair
    expect(plan.closing).toBe(false);
  });

  it('opens a letter without hero photo on a right page', () => {
    expect(pageFillers([letter('a', 15), letter('b', 20, false)], 9).fillers).toEqual(['b']);
    expect(pageFillers([letter('a', 16), letter('b', 21, false)], 9).fillers).toEqual([]);
    expect(pageFillers([letter('a', 12, false)], 9).fillers).toEqual(['a']);
  });

  it('closes the book on an even page', () => {
    expect(pageFillers([letter('a', 15)], 9).closing).toBe(true);
    expect(pageFillers([letter('a', 16), letter('b', 24)], 9)).toMatchObject({ fillers: ['b'], closing: true });
  });
});
