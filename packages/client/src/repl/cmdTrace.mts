import { isDefined } from '@internal/common-utils';
import asTable from 'as-table';
import type { Uri } from 'vscode';

import * as di from '../di.mjs';
import { colors } from './ansiUtils.mjs';

export interface TraceWordOptions {
    /** Show all dictionaries */
    all?: boolean;
    width: number;
    onlyFound?: boolean;
    onlyEnabled?: boolean;
    filetype?: string;
    allowCompoundWords?: boolean;
}

export async function traceWord(word: string, uri: Uri | string, options: TraceWordOptions): Promise<string> {
    const { width } = options;
    const client = di.get('client');
    const result = await client.serverApi.traceWord({
        word,
        uri: uri.toString(),
        searchAllDictionaries: true,
        languageId: options.filetype,
        allowCompoundWords: options.allowCompoundWords,
    });

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
    const filters = [
        options.all ? undefined : (trace: { found: boolean; dictEnabled: boolean }) => trace.found || trace.dictEnabled,
        options.onlyFound ? (trace: { found: boolean }) => trace.found : undefined,
        options.onlyEnabled ? (trace: { dictEnabled: boolean }) => trace.dictEnabled : undefined,
    ].filter(isDefined);

    const filter = combineFilters(filters);

    for (const trace of result.traces || []) {
        lines.push(`${trace.word}: ${trace.found ? '' : colors.yellow('Not found')}`);

        const entries = [...trace.traces].filter(filter).sort((a, b) => a.dictName.localeCompare(b.dictName));

        const data = entries.map((line) => {
            const dictionary = colors.yellow(line.dictName);
            return {
                Word: colorWord(line.word, line.foundWord, line.found),
                F: line.found ? colors.whiteBright('*') : colors.dim('-'),
                Dictionary: line.dictEnabled ? dictionary : colors.dim(dictionary),
            };
        });

        lines.push(toTable(data));
    }

    return lines.join('\n');
}

function combineFilters<T>(filters: ((t: T) => boolean)[]): (t: T) => boolean {
    return (t) => filters.every((f) => f(t));
}

function colorWord(word: string, foundWord: string | undefined, found: boolean): string {
    if (foundWord) {
        foundWord = foundWord.split('+').map(colors.green).join(colors.gray('+'));
    }
    const w = foundWord || colors.green(word);

    return found ? w : colors.dim(w);
}
