import fs from 'fs';
import path from 'path';
import { getImageData } from './blur';

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
    const file = path.join(process.cwd(), 'public', 'images', letterId, 'captions.json');
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

/** Returns videos for a letter (mov, mp4, webm in public/images/{id}/) */
export function getVideosForLetter(id: string): Video[] {
  const dir = path.join(process.cwd(), 'public', 'images', id);
  if (!fs.existsSync(dir)) return [];

  const captions = getPhotoCaptions(id);
  const files = fs.readdirSync(dir)
    .filter((f) => /\.(mov|mp4|webm)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  return files.map((f) => {
    const meta = captions[f] || captions[f.toLowerCase()];
    const poster = `${f.replace(/\.[^.]+$/, '')}-poster.jpg`;
    return {
      src: `/images/${id}/${f}`,
      poster: fs.existsSync(path.join(dir, poster)) ? `/images/${id}/${poster}` : undefined,
      name: meta?.caption ?? f.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      caption: meta?.caption,
    };
  });
}

/** Returns photos for a letter, with caption metadata from captions.json */
export async function getPhotosForLetter(id: string): Promise<Photo[]> {
    const dir = path.join(process.cwd(), 'public', 'images', id);
    if (!fs.existsSync(dir)) return [];

    const captions = getPhotoCaptions(id);
    const files = fs.readdirSync(dir)
        .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f) && !/-(thumb|poster)\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    const photos = files.map((f) => {
        const meta = captions[f] || captions[f.toLowerCase()];
        const ext = path.extname(f);
        const basename = path.basename(f, ext);
        // Miniature générée par scripts/media.mjs (même extension que l'original, ou .jpg)
        const thumbFilename = [`${basename}-thumb${ext}`, `${basename}-thumb.jpg`]
            .find((t) => fs.existsSync(path.join(dir, t)));

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
