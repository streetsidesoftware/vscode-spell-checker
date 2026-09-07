import { unindent } from './utils.mts';

export interface Definition {
    term: string;
    def: string;
}

export type DLTerms = (Definition | string)[];

export function singleDef(term: string, def: string): string {
    const lines: string[] = [];

    const defLines = def.replaceAll('```jsonc', '```json5');
    const termDef = `<dt>\n${term}\n</dt>\n<dd>\n\n${defLines}\n\n</dd>\n`;
    const termLines = termDef.split('\n').map((line) => line.trimEnd());

    lines.push(...termLines);

    return lines.join('\n');
}

export function renderMarkdownDL(terms: DLTerms): string {
    return unindent`
        <dl>

        ${terms.map((term) => (typeof term === 'string' ? term : singleDef(term.term, term.def))).join('\n')}

        </dl>
    `;
}
