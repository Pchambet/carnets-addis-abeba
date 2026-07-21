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

        const buffer = await fs.promises.readFile(fullPath);
        const image = sharp(buffer);
        
        const metadata = await image.metadata();
        
        const resizedBuffer = await image
            .resize(10)
            .jpeg({ quality: 20 })
            .toBuffer();
            
        const data: ImageData = {
            blurDataURL: `data:image/jpeg;base64,${resizedBuffer.toString('base64')}`,
            width: metadata.width,
            height: metadata.height
        };
        
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
