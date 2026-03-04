import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const lettersDirectory = path.join(process.cwd(), 'content/letters');

export interface LetterData {
    id: string;
    title: string;
    date: string;
    location?: string;
    excerpt?: string;
    pullQuote?: string;       // Extracted from "> PQ: ..." lines in markdown
    readTime: number;         // Estimated reading time in minutes
    contentHtml: string;
}

export function getSortedLettersData() {
    if (!fs.existsSync(lettersDirectory)) return [];

    const fileNames = fs.readdirSync(lettersDirectory);
    const allLettersData = fileNames
        .filter((f) => f.endsWith('.md'))
        .map((fileName) => {
            const id = fileName.replace(/\.md$/, '');
            const fullPath = path.join(lettersDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const matterResult = matter(fileContents);

            // Compute read time (average reader: 200 words/min in French)
            const words = matterResult.content.trim().split(/\s+/).length;
            const readTime = Math.max(1, Math.round(words / 200));

            return {
                id,
                readTime,
                ...(matterResult.data as { title: string; date: string; location?: string; excerpt?: string }),
            };
        });

    return allLettersData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Extract the "> PQ: …" pull quote from markdown content, if present */
function extractPullQuote(content: string): { pullQuote?: string; cleanContent: string } {
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

    // Extract pull quote before rendering HTML
    const { pullQuote, cleanContent } = extractPullQuote(matterResult.content);

    // Compute read time
    const words = cleanContent.trim().split(/\s+/).length;
    const readTime = Math.max(1, Math.round(words / 200));

    // Render markdown to HTML
    const processedContent = await remark().use(html).process(cleanContent);
    const contentHtml = processedContent.toString();

    return {
        id,
        contentHtml,
        pullQuote,
        readTime,
        ...(matterResult.data as { title: string; date: string; location?: string; excerpt?: string }),
    };
}
