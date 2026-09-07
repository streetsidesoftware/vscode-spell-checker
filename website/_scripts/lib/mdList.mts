import { unindent } from './utils.mts';

export function mdList(items: string[]): string {
    return unindent`
        <ul>

        ${items.map((item) => `<li>\n\n${item}\n</li>`).join('\n')}

        </ul>
    `;
}
