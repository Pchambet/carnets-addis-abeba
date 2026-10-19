import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { getImageData } from '../blur';

const imagesDir = path.join(process.cwd(), 'public', 'images');

/** Première photo du site tournée par l'EXIF (orientation 5 à 8) */
async function findRotatedPhoto(): Promise<string | undefined> {
    for (const dir of fs.readdirSync(imagesDir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
        for (const f of fs.readdirSync(path.join(imagesDir, dir.name)).filter((f) => /\.jpe?g$/i.test(f))) {
            const { orientation } = await sharp(path.join(imagesDir, dir.name, f)).metadata();
            if ((orientation ?? 1) >= 5) return `/images/${dir.name}/${f}`;
        }
    }
}

describe('getImageData', () => {
    it('gives an EXIF-rotated photo a placeholder in the same orientation as the photo', async () => {
        const src = await findRotatedPhoto();
        if (!src) return; // plus aucune photo tournée par l'EXIF : rien à vérifier
        const { blurDataURL, width, height } = await getImageData(src);
        const placeholder = await sharp(Buffer.from(blurDataURL!.split(',')[1], 'base64')).metadata();
        expect(placeholder.width! > placeholder.height!, src).toBe(width! > height!);
    });
});
