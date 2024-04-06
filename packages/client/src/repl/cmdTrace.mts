import type { Uri } from 'vscode';

import * as di from '../di.js';

export async function traceWord(word: string, uri: Uri | string, _width: number): Promise<string> {
    const client = di.get('client');
    const result = await client.serverApi.traceWord({ word, uri: uri.toString() });

    if (!result) {
        return 'No trace results';
    }

    const lines: string[] = [];

    lines.push(`Trace: "${result.word}"`);

    if (result.errors) {
        lines.push('Errors:');
        lines.push(`  ${result.errors}`);
    }

    for (const trace of result.traces || []) {
        lines.push(`${trace.word}: ${trace.found ? 'found' : 'not found'}`);
        for (const line of trace.traces) {
            const w = line.foundWord || line.word;
            lines.push(`${w} ${line.dictName} ${line.found ? 'found' : 'not found'}`);
        }
    }

    return lines.join('\n');
}
