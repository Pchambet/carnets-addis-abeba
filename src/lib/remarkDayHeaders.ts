import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Text } from 'mdast';
import { escapeHtml } from './html';

// Day names in French + their English/index mapping
const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const DAY_RE = new RegExp(`^((?:${DAY_NAMES.join('|')})(?:\\s+et\\s+[a-zA-Zéû]+)?)(.*)?$`);
/** « 12 », « 28 octobre », « 28 octobre 2025 » */
const DATE_ONLY = /^\d{1,2}(\s+[a-zéû]+)?(\s+\d{4})?$/i;

export interface DayHeader {
    /** « Lundi », « Jeudi et vendredi » */
    name: string;
    /** 1 (lundi) à 7 (dimanche), d'après le premier jour nommé */
    index: number;
    date?: string;
    desc?: string;
}

/** « Mardi 28 octobre ~ Description » → jour, date, description ; null si le texte ne commence pas par un jour */
export function parseDayHeader(text: string): DayHeader | null {
    const match = text.trim().match(DAY_RE);
    if (!match) return null;

    const name = match[1];
    // Everything after the day name (e.g. " 28 octobre ~ Description")
    const rest = (match[2] || '').replace(/^[\s~–-]+/, '').trim();

    // Parse date part before ~ if present
    const tildeIdx = rest.indexOf('~');
    // Sans « ~ », une date seule (« Mercredi 12 », « Mardi 28 octobre ») reste une date
    const dateOnly = tildeIdx === -1 && DATE_ONLY.test(rest);
    const date = tildeIdx > -1 ? rest.slice(0, tildeIdx).trim() : dateOnly ? rest : '';
    const desc = tildeIdx > -1 ? rest.slice(tildeIdx + 1).trim() : dateOnly ? '' : rest;

    // Compute day index from the first word (e.g. "Jeudi" from "Jeudi et vendredi")
    const firstDay = name.split(' ')[0];
    const index = DAY_NAMES.indexOf(firstDay.charAt(0).toUpperCase() + firstDay.slice(1).toLowerCase()) + 1;
    return { name, index, ...(date && { date }), ...(desc && { desc }) };
}

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

            // Extract the raw text inside the bold (plain text only: « **Mardi ~ au *marché*** » stays as written)
            const textNode = child.children[0] as Text;
            if (child.children.length !== 1 || textNode.type !== 'text') return;
            const day = parseDayHeader(textNode.value);
            if (!day) return;

            const html = [
                `<div class="day-section" data-day="${day.index}">`,
                `  <div class="day-section-rule"></div>`,
                `  <div class="day-section-header">`,
                `    <span class="day-name">${escapeHtml(day.name)}</span>`,
                day.date ? `    <span class="day-date">${escapeHtml(day.date)}</span>` : '',
                `  </div>`,
                day.desc ? `  <p class="day-desc">${escapeHtml(day.desc)}</p>` : '',
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
