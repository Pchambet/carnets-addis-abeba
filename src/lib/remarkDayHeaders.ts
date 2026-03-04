import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Strong, Text, PhrasingContent } from 'mdast';

// Day names in French + their English/index mapping
const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const DAY_RE = new RegExp(`^(${DAY_NAMES.join('|')})(.*)?$`);

/**
 * remarkDayHeaders — Remark plugin
 *
 * Detects lines that are purely a bold day name, like:
 *   **Lundi**
 *   **Mardi 28 octobre ~ Description de la journée**
 *
 * Transforms them into custom HTML day-section dividers:
 *   <div class="day-section"><span class="day-name">Lundi</span><span class="day-meta">28 octobre</span></div>
 */
export function remarkDayHeaders() {
    return (tree: Root) => {
        visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
            // Must be a single Strong child (the **…** pattern)
            if (node.children.length !== 1) return;
            const child = node.children[0];
            if (child.type !== 'strong') return;

            // Extract the raw text inside the bold
            const textNode = child.children[0] as Text;
            if (!textNode || textNode.type !== 'text') return;
            const rawText = textNode.value.trim();

            // Check if it starts with a day name
            const match = rawText.match(DAY_RE);
            if (!match) return;

            const dayName = match[1];
            // Everything after the day name (e.g. " 28 octobre ~ Description")
            const rest = (match[2] || '').replace(/^[\s~–-]+/, '').trim();

            // Parse date part before ~ if present
            const tildeIdx = rest.indexOf('~');
            const datePart = tildeIdx > -1 ? rest.slice(0, tildeIdx).trim() : '';
            const descPart = tildeIdx > -1 ? rest.slice(tildeIdx + 1).trim() : rest;

            // Build the HTML for the day divider
            const dayIndex = DAY_NAMES.indexOf(dayName) + 1;
            const html = [
                `<div class="day-section" data-day="${dayIndex}">`,
                `  <div class="day-section-rule"></div>`,
                `  <div class="day-section-header">`,
                `    <span class="day-name">${dayName}</span>`,
                datePart ? `    <span class="day-date">${datePart}</span>` : '',
                `  </div>`,
                descPart ? `  <p class="day-desc">${descPart}</p>` : '',
                `</div>`,
            ].filter(Boolean).join('\n');

            // Replace the paragraph node with raw HTML
            if (parent && index !== undefined) {
                (parent.children as unknown[]).splice(index, 1, {
                    type: 'html',
                    value: html,
                });
            }
        });
    };
}
