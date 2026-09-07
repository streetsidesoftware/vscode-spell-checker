import { unindent } from './utils.mts';

export function mdDetails(summary: string, content: string): string {
    return unindent`
        <details>
        <summary>

        ${summary}

        </summary>

        ${content}

        </details>
    `;
}
