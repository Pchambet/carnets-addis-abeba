import { describe, expect, it } from 'vitest';
import { locationAnchor } from '../map-locations';

describe('locationAnchor', () => {
    it.each([
        ['Addis-Abéba', 'lieu-addis-abeba'],
        ['Annecy (Maison de Claire)', 'lieu-annecy-maison-de-claire'],
        ['Pays gouragué', 'lieu-pays-gourague'],
    ])('%s → #%s', (name, anchor) => {
        expect(locationAnchor(name)).toBe(anchor);
    });
});
