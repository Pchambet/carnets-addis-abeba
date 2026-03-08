import fs from 'fs';
import path from 'path';
import { getSortedLettersData } from './letters';

const themesPath = path.join(process.cwd(), 'content/letter-themes.json');

export type LetterThemeMap = Record<string, string[]>;

export function getLetterThemeMap(): LetterThemeMap {
  if (!fs.existsSync(themesPath)) return {};
  const raw = fs.readFileSync(themesPath, 'utf8');
  try {
    return JSON.parse(raw) as LetterThemeMap;
  } catch {
    return {};
  }
}

export function getLettersForTheme(themeSlug: string): ReturnType<typeof getSortedLettersData> {
  const map = getLetterThemeMap();
  const letters = getSortedLettersData();
  const ids = Object.entries(map)
    .filter(([, themes]) => themes.includes(themeSlug))
    .map(([id]) => id);
  return letters.filter((l) => ids.includes(l.id));
}

export function getThemeLetterCounts(): Record<string, number> {
  const map = getLetterThemeMap();
  const counts: Record<string, number> = {};
  for (const themes of Object.values(map)) {
    for (const t of themes) {
      counts[t] = (counts[t] ?? 0) + 1;
    }
  }
  return counts;
}
