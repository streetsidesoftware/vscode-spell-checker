import asTable from 'as-table';
import type { Uri } from 'vscode';

import * as di from '../di.js';
import { colors } from './ansiUtils.mjs';

export interface TraceWordOptions {
    /** Show all dictionaries */
    all?: boolean;
    width: number;
}

export async function traceWord(word: string, uri: Uri | string, options: TraceWordOptions): Promise<string> {
    const { width } = options;
    const client = di.get('client');
    const result = await client.serverApi.traceWord({ word, uri: uri.toString(), searchAllDictionaries: true });

    if (!result) {
        return 'No trace results';
    }

    const lines: string[] = [];

    lines.push(`Trace: "${result.word}"`);

    if (result.errors) {
        lines.push(colors.red('Errors:'));
        lines.push(`  ${result.errors}`);
    }

    const toTable = asTable.configure({ maxTotalWidth: width });
    const filter = options.all ? () => true : (trace: { found: boolean; dictEnabled: boolean }) => trace.found || trace.dictEnabled;

    for (const trace of result.traces || []) {
        lines.push(`${trace.word}: ${trace.found ? '' : colors.yellow('Not found')}`);

        const entries = [...trace.traces].filter(filter).sort((a, b) => a.dictName.localeCompare(b.dictName));

        const data = entries.map((line) => {
            const dictionary = colors.yellow(line.dictName);
            return {
                Word: colors.green(line.foundWord || line.word),
                F: line.found ? colors.whiteBright('*') : colors.dim('-'),
                Dictionary: line.dictEnabled ? dictionary : colors.dim(dictionary),
            };
        });

        lines.push(toTable(data));
    }

    return lines.join('\n');
}
