import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export interface ImageData {
    blurDataURL?: string;
    width?: number;
    height?: number;
}

// Cache complet
const imageCache = new Map<string, ImageData>();

/** Dimensions affichées (orientation EXIF comprise), sans calcul d'aperçu : métadonnées seules */
export async function getImageSize(imagePath: string): Promise<ImageData> {
    const { width, height, orientation = 1 } = await sharp(path.join(process.cwd(), 'public', imagePath)).metadata();
    return orientation >= 5 ? { width: height, height: width } : { width, height };
}

/**
 * Lit une image locale et génère sa miniature base64 et extrait ses dimensions
 */
export async function getImageData(imagePath: string | null | undefined): Promise<ImageData> {
    if (!imagePath || imagePath.startsWith('http')) return {};

    if (imageCache.has(imagePath)) {
        return imageCache.get(imagePath)!;
    }

    try {
        const fullPath = path.join(process.cwd(), 'public', imagePath);
        
        if (!fs.existsSync(fullPath)) {
            return {};
        }

        // rotate() : l'aperçu perd l'EXIF, il doit donc être tourné comme la photo affichée
        const [size, preview] = await Promise.all([
            getImageSize(imagePath),
            sharp(fullPath).rotate().resize(10).jpeg({ quality: 20 }).toBuffer(),
        ]);
        const data: ImageData = { blurDataURL: `data:image/jpeg;base64,${preview.toString('base64')}`, ...size };

        imageCache.set(imagePath, data);
        return data;
    } catch (error) {
        console.error(`Erreur d'extraction des données pour ${imagePath}:`, error);
        return {};
    }
}

// Compatibilité descendante
export async function getBlurDataURL(imagePath: string | null | undefined): Promise<string | undefined> {
    const data = await getImageData(imagePath);
    return data.blurDataURL;
}
