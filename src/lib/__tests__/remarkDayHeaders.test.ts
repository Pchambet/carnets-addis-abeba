import { describe, it, expect } from 'vitest';
import { remark } from 'remark';
import html from 'remark-html';
import { remarkDayHeaders } from '../remarkDayHeaders';

async function process(md: string): Promise<string> {
  return remark()
    .use(remarkDayHeaders)
    .use(html, { sanitize: false })
    .process(md)
    .then((v) => v.toString());
}

describe('remarkDayHeaders', () => {
  it('transforms **Lundi** into day-section', async () => {
    const out = await process('**Lundi**\n\nTexte après.');
    expect(out).toContain('day-section');
    expect(out).toContain('day-name">Lundi</span>');
    expect(out).toContain('data-day="1"');
  });

  it('transforms **Mardi 28 octobre ~ Description** with date and desc', async () => {
    const out = await process('**Mardi 28 octobre ~ Description de la journée**\n\nSuite.');
    expect(out).toContain('day-name">Mardi</span>');
    expect(out).toContain('day-date">28 octobre</span>');
    expect(out).toContain('day-desc">Description de la journée</p>');
    expect(out).toContain('data-day="2"');
  });

  it('handles all weekdays with correct data-day index', async () => {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    for (let i = 0; i < days.length; i++) {
      const out = await process(`**${days[i]}**\n\nx`);
      expect(out).toContain(`data-day="${i + 1}"`);
    }
  });

  it('escapes HTML special chars in date/desc (e.g. & for XSS)', async () => {
    const out = await process('**Lundi 28 & 29 octobre**\n\nx');
    expect(out).toContain('28 &amp; 29 octobre');
  });

  it('does NOT transform bold text that is not a day name', async () => {
    const out = await process('**Important**\n\nTexte.');
    expect(out).not.toContain('day-section');
    expect(out).toContain('<strong>Important</strong>');
  });

  it('does NOT transform paragraph with multiple children', async () => {
    const out = await process('**Lundi** et autre texte\n\nSuite.');
    expect(out).not.toContain('day-section');
  });

  it('keeps normal paragraphs unchanged', async () => {
    const out = await process('Paragraphe normal.\n\n**Lundi**\n\nSuite.');
    expect(out).toContain('Paragraphe normal.');
    expect(out).toContain('day-section');
    expect(out).toContain('Suite.');
  });
});
