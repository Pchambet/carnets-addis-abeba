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
    contentHtml: string;
}

export function getSortedLettersData() {
    // Get file names under /content/letters
    if (!fs.existsSync(lettersDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(lettersDirectory);
    const allLettersData = fileNames
        .filter((fileName) => fileName.endsWith('.md'))
        .map((fileName) => {
            // Remove ".md" from file name to get id
            const id = fileName.replace(/\.md$/, '');

            // Read markdown file as string
            const fullPath = path.join(lettersDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');

            // Use gray-matter to parse the post metadata section
            const matterResult = matter(fileContents);

            // Combine the data with the id
            return {
                id,
                ...(matterResult.data as { title: string; date: string; location?: string; excerpt?: string }),
            };
        });

    // Sort posts by date
    return allLettersData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

export async function getLetterData(id: string): Promise<LetterData> {
    const fullPath = path.join(lettersDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();

    // Combine the data with the id and contentHtml
    return {
        id,
        contentHtml,
        ...(matterResult.data as { title: string; date: string; location?: string; excerpt?: string }),
    };
}
