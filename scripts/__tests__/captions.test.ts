import { describe, expect, it } from 'vitest';
import { captionFrom } from '../captions.mjs';

describe('captionFrom', () => {
    it.each([
        ['Retour à Addis ~ L’Ali', 'Retour à Addis ~ L’Ali'],
        ['Yohannis est de retour, mon cadeau_', 'Yohannis est de retour, mon cadeau'],
        ['Marché  de   Merkato ', 'Marché de Merkato'],
        ['20260927_172943 Meskel au village', '20260927_172943 Meskel au village'],
    ])('keeps the name Claire gave: %s', (base, caption) => {
        expect(captionFrom(base)).toBe(caption);
    });

    it.each([
        'IMG_4062',
        'DSCF5588',
        'IMG-20260725-WA0128_Original',
        'PXL_20260101_120000',
        '20260927_172943',
        '06e60541-9fb5-4315-a815-4afb72746192',
        '1234',
        'a',
    ])('gives no caption for a device name: %s', (base) => {
        expect(captionFrom(base)).toBeNull();
    });
});
