import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// In-memory cache to avoid recomputing base64 strings during development/build
const blurCache = new Map<string, string>();

/**
 * Lit une image locale depuis le dossier public et génère une très petite
 * miniature encodée en base64 pour l'attribut blurDataURL de next/image.
 */
export async function getBlurDataURL(imagePath: string | null | undefined): Promise<string | undefined> {
    if (!imagePath) return undefined;
    
    // Ignore les URLs distantes pour ne pas bloquer le build
    if (imagePath.startsWith('http')) return undefined;

    if (blurCache.has(imagePath)) {
        return blurCache.get(imagePath);
    }

    try {
        const fullPath = path.join(process.cwd(), 'public', imagePath);
        
        if (!fs.existsSync(fullPath)) {
            return undefined;
        }

        const buffer = await fs.promises.readFile(fullPath);
        
        // Redimensionner à 10px de large (hauteur proportionnelle) et ultra-compresser
        const resizedBuffer = await sharp(buffer)
            .resize(10)
            .jpeg({ quality: 20 })
            .toBuffer();
            
        const base64 = `data:image/jpeg;base64,${resizedBuffer.toString('base64')}`;
        
        blurCache.set(imagePath, base64);
        return base64;
    } catch (error) {
        console.error(`Erreur de génération de blurDataURL pour ${imagePath}:`, error);
        return undefined;
    }
}
