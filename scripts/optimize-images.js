import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_IMAGES_DIR = path.join(__dirname, '../public/images');

async function optimizeImages() {
    console.log(`Recherche des images dans ${PUBLIC_IMAGES_DIR}...`);
    
    // Trouver toutes les images JPG/PNG
    const files = await glob('**/*.{jpg,jpeg,png,webp}', { 
        cwd: PUBLIC_IMAGES_DIR, 
        absolute: true,
        nocase: true 
    });

    console.log(`${files.length} images trouvées. Début de l'optimisation...`);
    let totalSaved = 0;
    let totalOriginal = 0;

    for (const file of files) {
        try {
            const stats = await fs.stat(file);
            const originalSize = stats.size;
            totalOriginal += originalSize;

            // Lire l'image en buffer
            const imageBuffer = await fs.readFile(file);
            
            // Traiter avec sharp
            const optimizedBuffer = await sharp(imageBuffer)
                .resize({
                    width: 1600,
                    withoutEnlargement: true, // Ne pas agrandir les petites images
                    fit: 'inside'
                })
                .jpeg({
                    quality: 80,
                    progressive: true, // Chargement progressif UX
                    mozjpeg: true
                })
                .toBuffer();
                
            const newSize = optimizedBuffer.length;
            
            // Remplacer le fichier original
            await fs.writeFile(file, optimizedBuffer);
            
            const saved = originalSize - newSize;
            if (saved > 0) {
                totalSaved += saved;
                console.log(`✅ [Optimisée] ${path.basename(file)} : ${(originalSize / 1024 / 1024).toFixed(2)} MB -> ${(newSize / 1024 / 1024).toFixed(2)} MB (-${((saved / originalSize) * 100).toFixed(0)}%)`);
            } else {
                console.log(`⚡ [Déjà opti] ${path.basename(file)}`);
            }
        } catch (error) {
            console.error(`❌ Erreur sur ${path.basename(file)}:`, error.message);
        }
    }

    console.log('\n====================================');
    console.log('🎉 OPTIMISATION TERMINÉE');
    console.log(`Taille originale totale : ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Nouvelle taille totale  : ${((totalOriginal - totalSaved) / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Économie totale de      : ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
    console.log('====================================\n');
}

optimizeImages().catch(console.error);
