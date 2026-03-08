import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { remarkDayHeaders } from './remarkDayHeaders';

const lettersDirectory = path.join(process.cwd(), 'content/letters');

export interface LetterData {
    id: string;
    title: string;
    date: string;
    location?: string;
    excerpt?: string;
    pullQuote?: string;
    heroImage?: string;
    heroPosition?: string; // ex: "top", "center 30%"
    readTime: number;
    contentHtml: string;
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
            const words = matterResult.content.trim().split(/\s+/).length;
            const readTime = Math.max(1, Math.round(words / 200));

            return {
                id,
                readTime,
                ...(matterResult.data as { title: string; date: string; location?: string; excerpt?: string; heroImage?: string; heroPosition?: string }),
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

    // 3. Compute read time
    const words = cleanContent.trim().split(/\s+/).length;
    const readTime = Math.max(1, Math.round(words / 200));

    // 4. Render Markdown → HTML (with day-header plugin)
    const processedContent = await remark()
        .use(remarkDayHeaders)   // ← transforms **Lundi** etc. into day-section HTML
        .use(html, { sanitize: false }) // sanitize:false to allow the custom HTML
        .process(cleanContent);
    const contentHtml = processedContent.toString();

    return {
        id,
        contentHtml,
        pullQuote,
        readTime,
        ...(matterResult.data as { title: string; date: string; location?: string; excerpt?: string; heroImage?: string; heroPosition?: string }),
    };
}
