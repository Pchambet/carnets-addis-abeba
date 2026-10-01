import fs from 'fs';
import path from 'path';
import { getImageData } from './blur';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

export interface PhotoCaption {
    caption?: string;
}

export interface Photo {
    src: string;
    thumbSrc?: string;
    name: string;
    caption?: string;
    blurDataURL?: string;
    width?: number;
    height?: number;
}

function getPhotoCaptions(letterId: string): Record<string, PhotoCaption> {
    const file = path.join(IMAGES_DIR, letterId, 'captions.json');
    if (!fs.existsSync(file)) return {};
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, PhotoCaption>;
    } catch {
        return {};
    }
}

export interface Video {
  src: string;
  poster?: string;
  name: string;
  caption?: string;
}

/**
 * Fichiers d'un dossier, indexés par nom normalisé (NFC). La comparaison reste exacte
 * (casse comprise) comme sur le serveur, et indépendante de la normalisation Unicode du Mac.
 */
export function listFiles(dir: string): Map<string, string> {
    if (!fs.existsSync(dir)) return new Map();
    return new Map(fs.readdirSync(dir).map((f) => [f.normalize('NFC'), f]));
}

/** Miniature générée par scripts/media.mjs : même extension que l'original, ou .jpg */
export function findThumb(files: Map<string, string>, filename: string): string | undefined {
    const ext = path.extname(filename);
    const base = ext ? filename.slice(0, -ext.length) : filename;
    return [`${base}-thumb${ext}`, `${base}-thumb.jpg`]
        .map((t) => files.get(t.normalize('NFC')))
        .find(Boolean);
}

/** Returns videos for a letter (mov, mp4, webm in public/images/{id}/) */
export function getVideosForLetter(id: string): Video[] {
  const dir = path.join(IMAGES_DIR, id);
  if (!fs.existsSync(dir)) return [];

  const captions = getPhotoCaptions(id);
  const names = listFiles(dir);
  const files = [...names.values()]
    .filter((f) => /\.(mov|mp4|webm)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  return files.map((f) => {
    const meta = captions[f] || captions[f.toLowerCase()];
    const poster = names.get(`${f.replace(/\.[^.]+$/, '')}-poster.jpg`.normalize('NFC'));
    return {
      src: `/images/${id}/${f}`,
      poster: poster ? `/images/${id}/${poster}` : undefined,
      name: meta?.caption ?? f.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      caption: meta?.caption,
    };
  });
}

/** Returns photos for a letter, with caption metadata from captions.json */
export async function getPhotosForLetter(id: string): Promise<Photo[]> {
    const dir = path.join(IMAGES_DIR, id);
    if (!fs.existsSync(dir)) return [];

    const captions = getPhotoCaptions(id);
    const names = listFiles(dir);
    const files = [...names.values()]
        .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f) && !/-(thumb|poster)\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    const photos = files.map((f) => {
        const meta = captions[f] || captions[f.toLowerCase()];
        const thumbFilename = findThumb(names, f);

        return {
            src: `/images/${id}/${f}`,
            thumbSrc: thumbFilename ? `/images/${id}/${thumbFilename}` : undefined,
            name: meta?.caption ?? f.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
            caption: meta?.caption,
        };
    });

    return Promise.all(photos.map(async (photo) => {
        const data = await getImageData(photo.src);
        return {
            ...photo,
            blurDataURL: data.blurDataURL,
            width: data.width,
            height: data.height
        };
    }));
}

/**
 * Vignette d'une lettre pour les listes : miniature de l'image hero, sinon de la première photo.
 */
export function getLetterCover(id: string, heroImage?: string): string | undefined {
    let src = heroImage;
    if (!src) {
        const first = [...listFiles(path.join(IMAGES_DIR, id)).values()]
            .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f) && !/-(thumb|poster)\./i.test(f))
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))[0];
        if (first) src = `/images/${id}/${first}`;
    }
    if (!src) return undefined;

    const dir = path.dirname(src);
    const thumb = findThumb(listFiles(path.join(PUBLIC_DIR, dir)), path.basename(src));
    return thumb ? `${dir}/${thumb}` : src;
}
