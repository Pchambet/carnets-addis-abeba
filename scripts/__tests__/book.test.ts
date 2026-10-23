import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import matter from 'gray-matter';
import { cleanMarkdown, extractPullQuote } from '@/lib/letters';
import { bookTypography, choosePhotos, dateLabel, heroFrame, layoutRows, paginate, toBlocks } from '../book-data';

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

describe('layoutRows', () => {
  const photo = (w: number, h: number, caption?: string) => ({ src: `${w}x${h}`, width: w, height: h, caption });
  const opts = { width: 160, gap: 3, target: 50, maxPerRow: 3 };

  it('fills the width exactly, gaps included, without cropping', () => {
    const rows = layoutRows([photo(1500, 1000), photo(1500, 1000), photo(1000, 1500), photo(1500, 1000)], opts);
    for (const row of rows.slice(0, -1)) {
      const used = row.items.reduce((s, it) => s + it.w, 0) + opts.gap * (row.items.length - 1);
      expect(used).toBeCloseTo(opts.width, 6);
      for (const it of row.items) {
        const p = photo(...(it.src.split('x').map(Number) as [number, number]));
        expect(it.w / row.h).toBeCloseTo(p.width / p.height, 6);
      }
    }
  });

  it('keeps every photo, in order, with its caption', () => {
    const photos = [photo(1500, 1000, 'Le marché'), photo(1000, 1500), photo(1500, 1000), photo(1500, 1000), photo(1000, 1000)];
    const items = layoutRows(photos, opts).flatMap((r) => r.items);
    expect(items.map((i) => i.src)).toEqual(photos.map((p) => p.src));
    expect(items[0].caption).toBe('Le marché');
  });

  it('does not blow up a lone last photo to the full width', () => {
    const rows = layoutRows([photo(1500, 1000), photo(1500, 1000), photo(1000, 1500)], { ...opts, maxPerRow: 2 });
    const last = rows.at(-1)!;
    expect(last.items).toHaveLength(1);
    expect(last.h).toBeLessThanOrEqual(opts.target);
    expect(last.items[0].w).toBeLessThan(opts.width);
  });

  it('never exceeds the height it is given', () => {
    const rows = layoutRows([photo(1000, 3000)], { ...opts, target: 200, maxHeight: 120 });
    expect(rows[0].h).toBeLessThanOrEqual(120);
  });
});

describe('paginate', () => {
  const row = (h: number, caption?: string) => ({ h, items: [{ src: `${h}`, w: 50, ...(caption && { caption }) }] });
  const opts = { height: 160, gap: 6, caption: { first: 4, line: 3.5, charWidth: 1.2 } };

  it('fills each page as far as the rows fit, in order', () => {
    const rows = [row(48), row(48), row(48), row(48), row(70)];
    expect(paginate(rows, opts).map((page) => page.map((r) => r.h))).toEqual([[48, 48, 48], [48, 70]]);
  });

  it('shrinks a page a little rather than leave a row alone', () => {
    const [page, ...rest] = paginate([row(80), row(80)], opts);
    expect(rest).toEqual([]);
    const s = (160 - 6) / 160;
    expect(page.map((r) => r.h)).toEqual([80 * s, 80 * s]);
    expect(page[0].items[0].w).toBeCloseTo(50 * s, 6);
  });

  it('counts the room taken by captions, long ones on several lines', () => {
    const long = 'Après la folie des américains, le regard perdu dans le vide, il attend que la fête recommence. '.repeat(2);
    expect(paginate([row(50), row(50), row(50)], opts)).toHaveLength(1);
    expect(paginate([row(50, long), row(50, long), row(50)], opts).map((page) => page.length)).toEqual([2, 1]);
  });
});

describe('choosePhotos', () => {
  const photos = ['/images/s/a.jpg', '/images/s/b.jpg', '/images/s/c.jpg', '/images/s/d.jpg'].map((src) => ({ src }));
  const srcs = (list: { src: string }[]) => list.map((p) => p.src.slice(-5));

  it('opens on the hero image and lays out the others', () => {
    const { hero, grid } = choosePhotos(photos, { hero: '/images/s/c.jpg' });
    expect(hero?.src).toBe('/images/s/c.jpg');
    expect(srcs(grid)).toEqual(['a.jpg', 'b.jpg', 'd.jpg']);
  });

  it('opens on the first photo when the letter has no hero image', () => {
    const { hero, grid } = choosePhotos(photos, {});
    expect(hero?.src).toBe('/images/s/a.jpg');
    expect(srcs(grid)).toEqual(['b.jpg', 'c.jpg', 'd.jpg']);
  });

  it('keeps only the chosen photos, in the chosen order, never the hero twice', () => {
    expect(srcs(choosePhotos(photos, { hero: '/images/s/c.jpg', chosen: ['d.jpg', 'c.jpg', 'a.jpg'] }).grid)).toEqual(['d.jpg', 'a.jpg']);
    const { hero, grid } = choosePhotos(photos, { chosen: ['d.jpg', 'b.jpg'] });
    expect(hero?.src).toBe('/images/s/d.jpg');
    expect(srcs(grid)).toEqual(['b.jpg']);
  });

  it('names what it cannot find', () => {
    expect(() => choosePhotos(photos, { chosen: ['e.jpg'] })).toThrow(/e\.jpg/);
    expect(() => choosePhotos(photos, { hero: '/images/s/e.jpg' })).toThrow(/e\.jpg/);
  });
});

describe('heroFrame', () => {
  const box = { width: 220, height: 100 };

  it('fills the width and shows the requested part of a tall photo', () => {
    expect(heroFrame({ width: 1000, height: 1500 }, box, 'bottom')).toEqual({ w: 220, h: 330, dx: 0, dy: -(330 - 100) });
    expect(heroFrame({ width: 1000, height: 1500 }, box, 'center 10%').dy).toBeCloseTo(-(330 - 100) * 0.1, 6);
    expect(heroFrame({ width: 1000, height: 1500 }, box, undefined).dy).toBeCloseTo(-(330 - 100) / 2, 6);
  });

  it('fills the height and centres a very wide photo', () => {
    const frame = heroFrame({ width: 4000, height: 1000 }, box, 'center');
    expect(frame).toEqual({ w: 400, h: 100, dx: -90, dy: 0 });
  });
});
