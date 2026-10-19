import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

/**
 * Typographie française : espace insécable avant : ; ! ? » et après «, pour qu'aucun signe
 * ne passe seul à la ligne. Seuls les espaces déjà présents changent, jamais les mots.
 */
export function frenchSpacing(text: string): string {
    return text
        .replace(/[ \u00a0]+(?=[:;!?»])/g, '\u00a0')
        .replace(/«[ \u00a0]+/g, '«\u00a0');
}

/** frenchSpacing sur le texte des lettres seulement : la syntaxe Markdown n'est pas touchée */
export function remarkFrenchSpacing() {
    return (tree: Root) => {
        visit(tree, 'text', (node) => {
            node.value = frenchSpacing(node.value);
        });
    };
}
