import { describe, it, expect } from 'vitest';
import { remark } from 'remark';
import html from 'remark-html';
import { frenchSpacing, remarkFrenchSpacing } from '../typography';
import {
  weekLabel,
  cleanMarkdown,
  extractPullQuote,
  getSortedLettersData,
  getLetterData,
} from '../letters';

describe('weekLabel', () => {
  it('formats single and double weeks', () => {
    expect(weekLabel('semaine-08')).toBe('8');
    expect(weekLabel('semaine-44')).toBe('44');
    expect(weekLabel('semaine-29-30')).toBe('29–30');
    expect(weekLabel('autre')).toBeNull();
  });
});

describe('cleanMarkdown', () => {
  it('removes RTL/LTR marks', () => {
    expect(cleanMarkdown('Hello\u200e world\u200f')).toBe('Hello world');
  });

  it('replaces non-breaking spaces with regular space', () => {
    expect(cleanMarkdown('Hello\u00a0world')).toBe('Hello world');
  });

  it('reduces multiple blank lines to max 2', () => {
    expect(cleanMarkdown('A\n\n\n\n\nB')).toBe('A\n\nB');
  });

  it('removes trailing spaces on lines', () => {
    expect(cleanMarkdown('line1   \nline2  ')).toBe('line1\nline2');
  });
});

describe('frenchSpacing', () => {
  const NBSP = ' ';

  it('ties : ; ! ? » to the previous word and « to the next one', () => {
    expect(frenchSpacing('Voilà : « oui » ; non ! Pourquoi ?')).toBe(
      `Voilà${NBSP}: «${NBSP}oui${NBSP}»${NBSP}; non${NBSP}! Pourquoi${NBSP}?`
    );
  });

  it('keeps an existing non-breaking space there, and collapses doubled spaces', () => {
    expect(frenchSpacing(`Hosanna${NBSP}!  Alléluia  !`)).toBe(`Hosanna${NBSP}!  Alléluia${NBSP}!`);
  });

  it('leaves punctuation without a space before it alone', () => {
    expect(frenchSpacing('> PQ: citation. Alléluia!!!')).toBe('> PQ: citation. Alléluia!!!');
  });

  it('is applied to the text of the letter, never to the Markdown syntax', () => {
    const out = String(remark().use(remarkFrenchSpacing).use(html).processSync('- ? pourquoi\n\nIl pleut ! **Lundi :** oui'));
    expect(out).toContain('<li>? pourquoi</li>');
    expect(out).toContain(`Il pleut${NBSP}!`);
    expect(out).toContain(`Lundi${NBSP}:`);
  });
});

describe('extractPullQuote', () => {
  it('extracts PQ marker and removes it from content', () => {
    const input = '> PQ: Une citation importante.\n\nParagraphe suivant.';
    const result = extractPullQuote(input);
    expect(result.pullQuote).toBe('Une citation importante.');
    expect(result.cleanContent).not.toContain('> PQ:');
    expect(result.cleanContent.trim()).toBe('Paragraphe suivant.');
  });

  it('returns content unchanged when no PQ', () => {
    const input = 'Juste du texte.\n\nSans pull quote.';
    const result = extractPullQuote(input);
    expect(result.pullQuote).toBeUndefined();
    expect(result.cleanContent).toBe(input);
  });

  it('handles PQ with extra spaces', () => {
    const input = '>   PQ:   Citation  \n\nSuite';
    const result = extractPullQuote(input);
    expect(result.pullQuote).toBe('Citation');
  });
});

describe('getSortedLettersData', () => {
  it('returns an array of letters sorted by date descending', () => {
    const letters = getSortedLettersData();
    expect(Array.isArray(letters)).toBe(true);
    if (letters.length < 2) return;
    for (let i = 1; i < letters.length; i++) {
      expect(letters[i].date <= letters[i - 1].date).toBe(true);
    }
  });
});

describe('getLetterData', () => {
  it('returns full letter data for semaine-00', async () => {
    const data = await getLetterData('semaine-00');
    expect(data.id).toBe('semaine-00');
    expect(data.title).toBeDefined();
    expect(data.date).toBeDefined();
    expect(data.contentHtml).toContain('Claire');
  });

  it('extracts pull quote when present (semaine-15)', async () => {
    const data = await getLetterData('semaine-15');
    expect(data.pullQuote).toContain('grâce');
  });

  it('includes day-section HTML for letters with **Lundi** etc', async () => {
    // semaine-17 has **Lundi**, **Mardi**, **Mercredi** on their own lines
    const data = await getLetterData('semaine-17');
    expect(data.contentHtml).toContain('day-section');
    expect(data.contentHtml).toContain('day-name');
  });

  it('throws or returns error for non-existent letter', async () => {
    await expect(getLetterData('inexistant-xyz')).rejects.toThrow();
  });
});
