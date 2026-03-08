import fs from 'fs';
import path from 'path';

export interface PhotoCaption {
    caption?: string;
}

export interface Photo {
    src: string;
    name: string;
    caption?: string;
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
    return {
      src: `/images/${id}/${f}`,
      name: meta?.caption ?? f.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      caption: meta?.caption,
    };
  });
}

/** Returns photos for a letter, with caption metadata from captions.json */
export function getPhotosForLetter(id: string): Photo[] {
    const dir = path.join(process.cwd(), 'public', 'images', id);
    if (!fs.existsSync(dir)) return [];

    const captions = getPhotoCaptions(id);
    const files = fs.readdirSync(dir)
        .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    return files.map((f) => {
        const meta = captions[f] || captions[f.toLowerCase()];
        return {
            src: `/images/${id}/${f}`,
            name: meta?.caption ?? f.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
            caption: meta?.caption,
        };
    });
}
