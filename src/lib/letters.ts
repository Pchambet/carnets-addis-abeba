import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { remarkDayHeaders } from './remarkDayHeaders';
import { getBlurDataURL } from './blur';

const lettersDirectory = path.join(process.cwd(), 'content/letters');

interface LetterFrontmatter {
    title: string;
    date: string;
    location?: string;
    excerpt?: string;
    heroImage?: string;
    heroPosition?: string; // ex: "top", "center 30%"
}

export interface LetterData extends LetterFrontmatter {
    id: string;
    pullQuote?: string;
    heroBlurDataURL?: string;
    contentHtml: string;
}

/** ሳምንት = « semaine » en amharique */
export const ETHIOPIC_WEEK = 'ሳምንት';

/** Numéro de semaine affiché : "semaine-29-30" → "29–30", "semaine-08" → "8" */
export function weekLabel(id: string): string | null {
    const m = id.match(/^semaine-(\d+)(?:-(\d+))?$/);
    if (!m) return null;
    const first = String(parseInt(m[1], 10));
    return m[2] ? `${first}–${parseInt(m[2], 10)}` : first;
}

export function getSortedLettersData() {
    if (!fs.existsSync(lettersDirectory)) return [];

    const fileNames = fs.readdirSync(lettersDirectory);
    return fileNames
        .filter((f) => f.endsWith('.md'))
        .map((fileName) => {
            const id = fileName.replace(/\.md$/, '');
            const fullPath = path.join(lettersDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const matterResult = matter(fileContents);
            return {
                ...(matterResult.data as LetterFrontmatter),
                id,
            };
        })
        .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Clean common artefacts from .docx / .pages text extraction */
export function cleanMarkdown(raw: string): string {
    return raw
        // RTL / LTR marks from .docx
        .replace(/[\u200e\u200f]/g, '')
        // Non-breaking spaces → regular space
        .replace(/\u00a0/g, ' ')
        // Curly apostrophes → straight (for code consistency)
        // Keep curly quotes in text — they're beautiful
        // Multiple blank lines → max 2
        .replace(/\n{3,}/g, '\n\n')
        // Trailing spaces on lines
        .replace(/ +$/gm, '');
}

/** Extract "> PQ: …" pull quote marker from content */
export function extractPullQuote(content: string): { pullQuote?: string; cleanContent: string } {
    const pqMatch = content.match(/^>\s*PQ:\s*(.+)$/m);
    if (!pqMatch) return { cleanContent: content };
    const pullQuote = pqMatch[1].trim();
    const cleanContent = content.replace(/^>\s*PQ:\s*.+\n?/m, '');
    return { pullQuote, cleanContent };
}

export async function getLetterData(id: string): Promise<LetterData> {
    const fullPath = path.join(lettersDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    // 1. Clean artefacts
    const cleaned = cleanMarkdown(matterResult.content);

    // 2. Extract pull quote
    const { pullQuote, cleanContent } = extractPullQuote(cleaned);

    // 3. Render Markdown → HTML (with day-header plugin)
    const processedContent = await remark()
        .use(remarkDayHeaders)   // ← transforms **Lundi** etc. into day-section HTML
        .use(html, { sanitize: false }) // sanitize:false to allow the custom HTML
        .process(cleanContent);
    const contentHtml = processedContent.toString();

    const data = matterResult.data as LetterFrontmatter;

    return {
        ...data,
        id,
        contentHtml,
        pullQuote,
        heroBlurDataURL: await getBlurDataURL(data.heroImage),
    };
}
