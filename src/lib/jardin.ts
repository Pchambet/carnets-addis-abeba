import fs from 'fs';
import path from 'path';
import { getSortedLettersData } from './letters';

const themesPath = path.join(process.cwd(), 'content/letter-themes.json');
const journeyPath = path.join(process.cwd(), 'content/parcours-initiatique.json');

export type LetterThemeMap = Record<string, string[]>;

export function getLetterThemeMap(): LetterThemeMap {
  if (!fs.existsSync(themesPath)) return {};
  return JSON.parse(fs.readFileSync(themesPath, 'utf8')) as LetterThemeMap;
}

export function getLettersForTheme(themeSlug: string): ReturnType<typeof getSortedLettersData> {
  const map = getLetterThemeMap();
  const letters = getSortedLettersData();
  const ids = Object.entries(map)
    .filter(([, themes]) => themes.includes(themeSlug))
    .map(([id]) => id);
  return letters.filter((l) => ids.includes(l.id));
}


export interface JourneyQuestion {
  id: string;
  question: string;
  reponse: string;
  letters: string[];
}

interface ThemeJourney {
  theme: string;
  questions: JourneyQuestion[];
}

export function getJourneyQuestions(themeSlug: string): JourneyQuestion[] {
  if (!fs.existsSync(journeyPath)) return [];
  const journeys = JSON.parse(fs.readFileSync(journeyPath, 'utf8')) as ThemeJourney[];
  return journeys.find((j) => j.theme === themeSlug)?.questions ?? [];
}

/** Lettres que l'on peut atteindre depuis la page d'un thème : celles de ses questions. */
export function getThemeLetterCounts(): Record<string, number> {
  if (!fs.existsSync(journeyPath)) return {};
  const journeys = JSON.parse(fs.readFileSync(journeyPath, 'utf8')) as ThemeJourney[];
  return Object.fromEntries(
    journeys.map((j) => [j.theme, new Set(j.questions.flatMap((q) => q.letters)).size])
  );
}
